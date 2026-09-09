import { createRemoteJWKSet, jwtVerify } from "jose";
import {
  buildAuthorizationContext,
  requireApproved,
  requireOwnHousehold,
  requirePermission,
} from "./authorization.mjs";
import { familyDisplayName, normalizeFamilyLastName } from "./onboarding.mjs";
const ORG = "org-pack-321",
  enc = new TextEncoder(),
  id = (p) => `${p}_${crypto.randomUUID()}`,
  email = (e) =>
    String(e || "")
      .trim()
      .toLowerCase();
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...headers,
    },
  });
const page = (title, body, status = 200) =>
  new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | ScoutHQ</title><style>body{margin:0;background:#f4f7fa;color:#082b57;font:16px system-ui}.bar{background:#082b57;color:white;padding:18px 5vw}.bar b{color:#ffc72c;font-size:1.4rem}.wrap{max-width:860px;margin:48px auto;padding:0 24px}.card{background:white;border:1px solid #d8e0e8;border-radius:18px;padding:28px;box-shadow:0 12px 32px #082b5714}button,a.button{display:inline-block;border:0;border-radius:9px;padding:12px 18px;background:#ffc72c;color:#082b57;font-weight:800;text-decoration:none}input{display:block;width:min(100%,420px);padding:12px;margin:8px 0 18px}.muted{color:#52667b}.danger{color:#9c1c1c}.account-actions{display:flex;gap:18px;flex-wrap:wrap;margin-top:28px}.account-actions a{color:#082b57;font-weight:700}</style></head><body><header class="bar"><b>ScoutHQ</b> <span>Pack 321 staging</span></header><main class="wrap">${body}</main></body></html>`,
    {
      status,
      headers: {
        "content-type": "text/html;charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
const hash = async (value) =>
  [...new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(value)))]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
const cookie = (request, name) =>
  request.headers
    .get("cookie")
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(`${name}=`))
    ?.slice(name.length + 1);
const clearedSessionCookie =
  "scouthq_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
const accountActions =
  '<p class="account-actions"><a href="/logout">Sign out</a><a href="/switch-account">Switch account</a></p>';
const html = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
const onboardingForm = (user, value = "", error = "", correlationId = "") =>
  page(
    "Onboarding",
    `<section class="card"><h1>Set up your family</h1><p class="muted">Signed in as ${html(user.display_name)}</p>${error ? `<p class="danger" role="alert">${html(error)}${correlationId ? ` Reference: ${html(correlationId)}` : ""}</p>` : ""}<form method="post" action="/api/onboarding"><label for="familyLastName"><strong>Family Last Name</strong></label><p class="muted" id="familyHelp">Enter the last name your family should be listed under in ScoutHQ.</p><input id="familyLastName" name="familyLastName" value="${html(value)}" required maxlength="80" autocomplete="family-name" aria-describedby="familyHelp"><button type="submit">Save and Request Pack Access</button></form>${accountActions}</section>`,
    error ? 400 : 200,
  );
const revokeApplicationSession = async (request, db) => {
  const token = cookie(request, "scouthq_session");
  if (!token) return;
  await db
    .prepare(
      "UPDATE application_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE id_hash=? AND revoked_at IS NULL",
    )
    .bind(await hash(token))
    .run();
};
const accessIdentity = async (request, env) => {
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token)
    throw Object.assign(new Error("Access assertion missing"), {
      status: 401,
      category: "access_jwt_missing",
    });
  const issuer = env.ACCESS_TEAM_DOMAIN.replace(/\/$/, "");
  try {
    const { payload } = await jwtVerify(
      token,
      createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`)),
      { issuer, audience: env.ACCESS_AUD },
    );
    if (!payload.sub)
      throw Object.assign(new Error("Subject claim missing"), {
        status: 401,
        category: "access_subject_missing",
      });
    if (!payload.email)
      throw Object.assign(new Error("Email claim missing"), {
        status: 401,
        category: "access_email_missing",
      });
    return {
      sub: String(payload.sub),
      email: email(payload.email),
      name: String(payload.name || payload.email),
    };
  } catch (error) {
    if (error.category) throw error;
    const category =
      error.code === "ERR_JWT_CLAIM_VALIDATION_FAILED"
        ? "access_claim_validation_failed"
        : error.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED"
          ? "access_signature_failed"
          : error.code === "ERR_JWKS_NO_MATCHING_KEY"
            ? "access_jwks_key_missing"
            : "access_jwt_verification_failed";
    throw Object.assign(new Error("Access identity verification failed"), {
      status: 401,
      category,
    });
  }
};
const upsert = async (db, a) => {
  let u = await db
    .prepare(
      "SELECT u.* FROM auth_identities ai JOIN users u ON u.id=ai.user_id WHERE ai.provider=? AND ai.provider_subject=?",
    )
    .bind("cloudflare-access", a.sub)
    .first();
  if (!u) {
    u = await db
      .prepare("SELECT * FROM users WHERE primary_email=? AND email_verified=1")
      .bind(a.email)
      .first();
    const uid = u?.id || id("usr");
    if (!u)
      await db
        .prepare(
          "INSERT INTO users(id,primary_email,email_verified,display_name,account_status,onboarding_status) VALUES(?,?,?,?, 'active','new')",
        )
        .bind(uid, a.email, 1, a.name)
        .run();
    await db
      .prepare(
        "INSERT INTO auth_identities(id,user_id,provider,provider_subject,provider_email,verified,last_authenticated_at) VALUES(?,?,?,?,?,1,CURRENT_TIMESTAMP)",
      )
      .bind(id("aid"), uid, "cloudflare-access", a.sub, a.email)
      .run();
    u = await db.prepare("SELECT * FROM users WHERE id=?").bind(uid).first();
  }
  await db
    .prepare("UPDATE users SET last_sign_in_at=CURRENT_TIMESTAMP WHERE id=?")
    .bind(u.id)
    .run();
  return u;
};
const session = async (request, db) => {
  const token = cookie(request, "scouthq_session");
  if (!token) return null;
  return db
    .prepare(
      "SELECT u.* FROM application_sessions s JOIN users u ON u.id=s.user_id WHERE s.id_hash=? AND s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP AND u.account_status='active'",
    )
    .bind(await hash(token))
    .first();
};
const audit = (db, actor, action, type, target, details = {}) =>
  db
    .prepare(
      "INSERT INTO audit_events(id,organization_id,actor_user_id,action,target_type,target_id,details_json) VALUES(?,?,?,?,?,?,?)",
    )
    .bind(id("aud"), ORG, actor, action, type, target, JSON.stringify(details))
    .run();
const requireSession = async (request, env) => {
  const u = await session(request, env.IDENTITY_DB);
  if (!u) throw Object.assign(new Error(), { status: 401 });
  return u;
};
const preferenceDefaults = {
  appearance: { mode: "system" },
  notifications: { packAnnouncements: true, denNotices: true, eventReminders: true, actionReminders: true, fundraisingUpdates: true },
  accessibility: { reducedMotion: false },
  communication: { replyBehavior: "conversation", digest: "daily-unread", autoSaveDrafts: true },
  calendar: { weekStartsOn: "sunday", defaultView: "agenda", timeFormat: "12-hour", dateFormat: "MM/DD/YYYY", reminder: "1-day" },
  privacy: { onlineStatus: true, profileVisibility: true, emailVisibility: false, phoneVisibility: false, activityVisibility: true },
};
const parseObject = (value) => {
  try { const parsed = JSON.parse(value || "{}"); return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}; } catch { return {}; }
};
const loadUserPreferences = async (db, user) => {
  const [profile, stored] = await Promise.all([
    db.prepare("SELECT preferred_name,phone_e164 FROM user_profiles WHERE user_id=?").bind(user.id).first(),
    db.prepare("SELECT * FROM user_preferences WHERE user_id=?").bind(user.id).first(),
  ]);
  return {
    profile: { preferredName: profile?.preferred_name || "", phone: profile?.phone_e164 || "", displayName: user.display_name, verifiedEmail: user.primary_email },
    appearance: { mode: stored?.appearance_mode || preferenceDefaults.appearance.mode },
    notifications: { ...preferenceDefaults.notifications, ...parseObject(stored?.notifications_json) },
    accessibility: { ...preferenceDefaults.accessibility, ...parseObject(stored?.accessibility_json) },
    communication: { ...preferenceDefaults.communication, ...parseObject(stored?.communication_json) },
    calendar: { ...preferenceDefaults.calendar, ...parseObject(stored?.calendar_json) },
    privacy: { ...preferenceDefaults.privacy, ...parseObject(stored?.privacy_json) },
  };
};
const oneOf = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;
const booleanValue = (value, fallback) => typeof value === "boolean" ? value : fallback;
const normalizePhone = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  const normalized = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith("1") ? `+${digits}` : "";
  if (!normalized) throw Object.assign(new Error("Enter a valid US phone number"), { status: 400, category: "preference_phone_invalid" });
  return normalized;
};
const updateUserPreferences = async (request, env, user) => {
  requireSameOriginPost(request);
  const submission = await request.json();
  for (const forbidden of ["user_id", "userId", "email", "primary_email", "role", "roles", "membership", "permissions", "household", "dependents", "provider_subject"]) {
    if (Object.prototype.hasOwnProperty.call(submission, forbidden)) throw Object.assign(new Error("Protected identity fields cannot be changed here"), { status: 400, category: "preference_protected_field" });
  }
  const current = await loadUserPreferences(env.IDENTITY_DB, user);
  const preferredName = String(submission.profile?.preferredName ?? current.profile.preferredName).trim();
  if (preferredName.length > 60 || /[<>]/.test(preferredName)) throw Object.assign(new Error("Preferred name must be 60 characters or fewer"), { status: 400, category: "preference_name_invalid" });
  const phone = normalizePhone(submission.profile?.phone ?? current.profile.phone);
  const appearance = { mode: oneOf(submission.appearance?.mode, ["system", "light", "dark"], current.appearance.mode) };
  const notifications = Object.fromEntries(Object.keys(preferenceDefaults.notifications).map((key) => [key, booleanValue(submission.notifications?.[key], current.notifications[key])]));
  const accessibility = { reducedMotion: booleanValue(submission.accessibility?.reducedMotion, current.accessibility.reducedMotion) };
  const communication = { replyBehavior: oneOf(submission.communication?.replyBehavior, ["conversation", "new-message"], current.communication.replyBehavior), digest: oneOf(submission.communication?.digest, ["immediate", "daily-unread", "off"], current.communication.digest), autoSaveDrafts: booleanValue(submission.communication?.autoSaveDrafts, current.communication.autoSaveDrafts) };
  const calendar = { weekStartsOn: oneOf(submission.calendar?.weekStartsOn, ["sunday", "monday"], current.calendar.weekStartsOn), defaultView: oneOf(submission.calendar?.defaultView, ["month", "week", "agenda", "timeline"], current.calendar.defaultView), timeFormat: oneOf(submission.calendar?.timeFormat, ["12-hour", "24-hour"], current.calendar.timeFormat), dateFormat: oneOf(submission.calendar?.dateFormat, ["MM/DD/YYYY", "DD/MM/YYYY"], current.calendar.dateFormat), reminder: oneOf(submission.calendar?.reminder, ["none", "1-hour", "1-day", "2-days"], current.calendar.reminder) };
  const privacy = Object.fromEntries(Object.keys(preferenceDefaults.privacy).map((key) => [key, booleanValue(submission.privacy?.[key], current.privacy[key])]));
  await env.IDENTITY_DB.batch([
    env.IDENTITY_DB.prepare("INSERT INTO user_profiles(user_id,preferred_name,phone_e164) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET preferred_name=excluded.preferred_name,phone_e164=excluded.phone_e164,updated_at=CURRENT_TIMESTAMP").bind(user.id, preferredName || null, phone),
    env.IDENTITY_DB.prepare("INSERT INTO user_preferences(user_id,appearance_mode,notifications_json,accessibility_json,communication_json,calendar_json,privacy_json) VALUES(?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET appearance_mode=excluded.appearance_mode,notifications_json=excluded.notifications_json,accessibility_json=excluded.accessibility_json,communication_json=excluded.communication_json,calendar_json=excluded.calendar_json,privacy_json=excluded.privacy_json,updated_at=CURRENT_TIMESTAMP").bind(user.id, appearance.mode, JSON.stringify(notifications), JSON.stringify(accessibility), JSON.stringify(communication), JSON.stringify(calendar), JSON.stringify(privacy)),
  ]);
  if (preferredName !== current.profile.preferredName || phone !== (current.profile.phone || null)) await audit(env.IDENTITY_DB, user.id, "user.profile.updated", "user", user.id, { preferredNameChanged: preferredName !== current.profile.preferredName, phoneChanged: phone !== (current.profile.phone || null) });
  return loadUserPreferences(env.IDENTITY_DB, user);
};
const readOnboardingSubmission = async (request) => {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return request.json();
  return Object.fromEntries(await request.formData());
};
const submitOnboarding = async (request, env, correlationId) => {
  const db = env.IDENTITY_DB;
  const user = await requireSession(request, env);
  let enteredValue = "";
  try {
    const submission = await readOnboardingSubmission(request);
    enteredValue = String(submission.familyLastName ?? submission.householdName ?? "");
    const lastName = normalizeFamilyLastName(enteredValue);
    const displayName = familyDisplayName(lastName);
    const [household, membership, accessRequest] = await Promise.all([
      db
        .prepare(
          "SELECT h.* FROM household_members hm JOIN households h ON h.id=hm.household_id WHERE hm.user_id=? AND hm.active=1 AND hm.primary_guardian=1 ORDER BY hm.created_at LIMIT 1",
        )
        .bind(user.id)
        .first(),
      db
        .prepare(
          "SELECT * FROM organization_memberships WHERE user_id=? AND organization_id=?",
        )
        .bind(user.id, ORG)
        .first(),
      db
        .prepare(
          "SELECT * FROM access_requests WHERE requester_user_id=? AND organization_id=? AND status IN ('pending','correction_requested') ORDER BY created_at LIMIT 1",
        )
        .bind(user.id, ORG)
        .first(),
    ]);

    if (membership?.status === "approved") {
      return new Response(null, { status: 303, headers: { location: "/" } });
    }

    const householdId = household?.id || id("hh");
    const membershipId = membership?.id || id("mem");
    const accessRequestId = accessRequest?.id || id("req");
    const onboardingId = id("onb");
    const statements = [
      household
        ? db
            .prepare(
              "UPDATE households SET display_name=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='preliminary'",
            )
            .bind(displayName, householdId)
        : db
            .prepare(
              "INSERT INTO households(id,organization_id,display_name,status) VALUES(?,?,?,'preliminary')",
            )
            .bind(householdId, ORG, displayName),
    ];
    if (!household) {
      statements.push(
        db
          .prepare(
            "INSERT INTO household_members(id,household_id,user_id,relationship,primary_guardian) VALUES(?,?,?,'guardian',1)",
          )
          .bind(id("hm"), householdId, user.id),
      );
    }
    statements.push(
      membership
        ? db
            .prepare(
              "UPDATE organization_memberships SET status='pending',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status IN ('requested','pending')",
            )
            .bind(membershipId)
        : db
            .prepare(
              "INSERT INTO organization_memberships(id,user_id,organization_id,status) VALUES(?,?,?,'pending')",
            )
            .bind(membershipId, user.id, ORG),
    );
    statements.push(
      accessRequest
        ? db
            .prepare(
              "UPDATE access_requests SET proposed_household_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
            )
            .bind(householdId, accessRequestId)
        : db
            .prepare(
              "INSERT INTO access_requests(id,requester_user_id,organization_id,proposed_household_id,requested_relationship,status) VALUES(?,?,?,?,'guardian','pending')",
            )
            .bind(accessRequestId, user.id, ORG, householdId),
      db
        .prepare(
          "UPDATE users SET onboarding_status='pending',updated_at=CURRENT_TIMESTAMP WHERE id=?",
        )
        .bind(user.id),
      db
        .prepare(
          "INSERT INTO onboarding_sessions(id,user_id,organization_id,household_id,current_step,state_json,status) VALUES(?,?,?,?,'access_request_submitted',?,'submitted') ON CONFLICT(user_id,status) DO UPDATE SET household_id=excluded.household_id,current_step=excluded.current_step,state_json=excluded.state_json,updated_at=CURRENT_TIMESTAMP",
        )
        .bind(onboardingId, user.id, ORG, householdId, JSON.stringify({ familyLastName: lastName })),
    );
    if (!accessRequest) {
      statements.push(
        db
          .prepare(
            "INSERT INTO audit_events(id,organization_id,actor_user_id,action,target_type,target_id,details_json) VALUES(?,?,?,?,?,?,?)",
          )
          .bind(
            id("aud"),
            ORG,
            user.id,
            "access_request.submitted",
            "access_request",
            accessRequestId,
            JSON.stringify({ source: "onboarding" }),
          ),
      );
    }
    await db.batch(statements);
    console.log(
      JSON.stringify({
        event: "onboarding_submitted",
        status: "success",
        reused: Boolean(accessRequest),
        correlationId,
      }),
    );
    return new Response(null, {
      status: 303,
      headers: { location: "/", "cache-control": "no-store", "x-request-id": correlationId },
    });
  } catch (error) {
    const existing = await db
      .prepare(
        "SELECT id FROM access_requests WHERE requester_user_id=? AND organization_id=? AND status IN ('pending','correction_requested') LIMIT 1",
      )
      .bind(user.id, ORG)
      .first();
    if (existing) return new Response(null, { status: 303, headers: { location: "/" } });
    const isValidation = error.status === 400;
    console.error(
      JSON.stringify({
        event: "onboarding_submitted",
        status: "failed",
        category: error.category || "onboarding_transaction_failed",
        correlationId,
      }),
    );
    return onboardingForm(
      user,
      enteredValue,
      isValidation
        ? error.message
        : "We couldn't submit your request. Your information has been preserved. Please try again.",
      isValidation ? "" : correlationId,
    );
  }
};
const requireSameOriginPost = (request) => {
  const origin = request.headers.get("origin");
  const requestOrigin = new URL(request.url).origin;
  if (origin && origin !== requestOrigin) {
    throw Object.assign(new Error("Cross-origin request denied"), {
      status: 403,
      category: "cross_origin_post_denied",
    });
  }
};
const approveAccessRequest = async (request, env, requestId, correlationId) => {
  requireSameOriginPost(request);
  if (env.ENVIRONMENT !== "staging") {
    throw Object.assign(new Error("Not found"), { status: 404 });
  }
  const db = env.IDENTITY_DB;
  const actor = await requireSession(request, env);
  const authorization = await buildAuthorizationContext(db, actor.id, ORG);
  requirePermission(authorization, "access_requests.review");
  const pending = await db
    .prepare(
      "SELECT ar.id,ar.requester_user_id,ar.proposed_household_id,om.id AS membership_id FROM access_requests ar JOIN organization_memberships om ON om.user_id=ar.requester_user_id AND om.organization_id=ar.organization_id WHERE ar.id=? AND ar.organization_id=? AND ar.status='pending' AND om.status='pending'",
    )
    .bind(requestId, ORG)
    .first();
  if (!pending) {
    const existing = await db
      .prepare(
        "SELECT status FROM access_requests WHERE id=? AND organization_id=?",
      )
      .bind(requestId, ORG)
      .first();
    if (existing?.status === "approved") {
      return new Response(null, {
        status: 303,
        headers: { location: "/approvals", "cache-control": "no-store" },
      });
    }
    throw Object.assign(new Error("Pending request not found"), {
      status: 404,
      category: "pending_access_request_not_found",
    });
  }
  const parentRole = await db.prepare("SELECT id FROM roles WHERE key='parent_guardian' AND active=1").first();
  if (!parentRole) {
    throw Object.assign(new Error("Parent role unavailable"), {
      status: 500,
      category: "parent_role_missing",
    });
  }
  try {
    await db.batch([
      db
        .prepare(
          "UPDATE organization_memberships SET status='approved',approved_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'",
        )
        .bind(pending.membership_id),
      db
        .prepare(
          "INSERT INTO membership_roles(id,membership_id,role_id,assigned_by_user_id) VALUES(?,?,?,?)",
        )
        .bind(id("mrole"), pending.membership_id, parentRole.id, actor.id),
      db
        .prepare(
          "UPDATE households SET status='active',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='preliminary'",
        )
        .bind(pending.proposed_household_id),
      db
        .prepare(
          "UPDATE access_requests SET status='approved',reviewed_by_user_id=?,reviewed_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'",
        )
        .bind(actor.id, requestId),
      db
        .prepare(
          "UPDATE users SET onboarding_status='complete',updated_at=CURRENT_TIMESTAMP WHERE id=?",
        )
        .bind(pending.requester_user_id),
      db
        .prepare(
          "UPDATE onboarding_sessions SET current_step='approved',status='complete',updated_at=CURRENT_TIMESTAMP WHERE user_id=? AND organization_id=? AND status='submitted'",
        )
        .bind(pending.requester_user_id, ORG),
      db
        .prepare(
          "INSERT INTO audit_events(id,organization_id,actor_user_id,action,target_type,target_id,details_json) VALUES(?,?,?,?,?,?,?)",
        )
        .bind(
          id("aud"),
          ORG,
          actor.id,
          "access_request.approved",
          "access_request",
          requestId,
          JSON.stringify({ resultingRole: "parent_guardian" }),
        ),
    ]);
  } catch (error) {
    const existing = await db
      .prepare("SELECT status FROM access_requests WHERE id=? AND organization_id=?")
      .bind(requestId, ORG)
      .first();
    if (existing?.status !== "approved") throw error;
  }
  console.log(
    JSON.stringify({ event: "access_request_approved", status: "success", correlationId }),
  );
  return new Response(null, {
    status: 303,
    headers: {
      location: "/approvals",
      "cache-control": "no-store",
      "x-request-id": correlationId,
    },
  });
};
const loadAppContext = async (db, user, path) => {
  const authorization = await buildAuthorizationContext(db, user.id, ORG);
  requireApproved(authorization);
  const organization = await db
    .prepare("SELECT id,display_name,founding_organization_mode FROM organizations WHERE id=?")
    .bind(ORG)
    .first();
  const roles = (
    await db
      .prepare(
        "SELECT r.key,r.name FROM membership_roles mr JOIN roles r ON r.id=mr.role_id WHERE mr.membership_id=? AND mr.active=1 AND r.active=1 AND (mr.ends_at IS NULL OR mr.ends_at>CURRENT_TIMESTAMP) ORDER BY r.name",
      )
      .bind(authorization.membership.id)
      .all()
  ).results;
  const household = await db
    .prepare(
      "SELECT h.id,h.display_name,h.status FROM household_members hm JOIN households h ON h.id=hm.household_id WHERE hm.user_id=? AND hm.active=1 ORDER BY hm.primary_guardian DESC,hm.created_at LIMIT 1",
    )
    .bind(user.id)
    .first();
  const dependents = household
    ? (
        await db
          .prepare(
            "SELECT id,display_name,status FROM dependents WHERE household_id=? AND status='active' ORDER BY display_name",
          )
          .bind(household.id)
          .all()
      ).results
    : [];
  const pendingCount = (
    await db
      .prepare(
        "SELECT COUNT(*) AS count FROM access_requests WHERE organization_id=? AND status='pending'",
      )
      .bind(ORG)
      .first()
  )?.count;
  const preferences = await loadUserPreferences(db, user);
  return {
    user: { id: user.id, display_name: user.display_name, preferred_name: preferences.profile.preferredName || null, email: user.primary_email, phone: preferences.profile.phone || null },
    organization: { id: organization.id, display_name: organization.display_name },
    membership: { status: authorization.membership.status },
    roles,
    permissions: authorization.permissions,
    householdIds: authorization.householdIds,
    household,
    dependents,
    pendingCount: Number(pendingCount || 0),
    isLeadership: authorization.permissions.includes("people.read"),
    foundingOrganizationMode: Boolean(organization.founding_organization_mode),
    preferences,
    path,
  };
};
const listPendingAccessRequests = async (db) =>
  (
    await db
      .prepare(
        "SELECT ar.id,ar.created_at,COALESCE(h.display_name,u.display_name) AS family_name,u.display_name AS guardian_name,(SELECT COUNT(*) FROM dependents d WHERE d.household_id=ar.proposed_household_id AND d.status='active') AS dependent_count FROM access_requests ar JOIN users u ON u.id=ar.requester_user_id LEFT JOIN households h ON h.id=ar.proposed_household_id WHERE ar.organization_id=? AND ar.status='pending' ORDER BY ar.created_at",
      )
      .bind(ORG)
      .all()
  ).results;
const reviewAccessRequest = async (request, env, requestId, action, correlationId) => {
  requireSameOriginPost(request);
  if (env.ENVIRONMENT !== "staging") throw Object.assign(new Error(), { status: 404 });
  if (action === "approve") return approveAccessRequest(request, env, requestId, correlationId);
  const db = env.IDENTITY_DB;
  const actor = await requireSession(request, env);
  const authorization = await buildAuthorizationContext(db, actor.id, ORG);
  requirePermission(authorization, "access_requests.review");
  const requestRow = await db
    .prepare(
      "SELECT ar.id,ar.requester_user_id,om.id AS membership_id FROM access_requests ar JOIN organization_memberships om ON om.user_id=ar.requester_user_id AND om.organization_id=ar.organization_id WHERE ar.id=? AND ar.organization_id=? AND ar.status='pending'",
    )
    .bind(requestId, ORG)
    .first();
  if (!requestRow) throw Object.assign(new Error("Pending request not found"), { status: 404 });
  const requestStatus = action === "needs-information" ? "correction_requested" : "denied";
  const membershipStatus = action === "needs-information" ? "pending" : "denied";
  await db.batch([
    db
      .prepare(
        "UPDATE access_requests SET status=?,reviewed_by_user_id=?,reviewed_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'",
      )
      .bind(requestStatus, actor.id, requestId),
    db
      .prepare(
        "UPDATE organization_memberships SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'",
      )
      .bind(membershipStatus, requestRow.membership_id),
    db
      .prepare(
        "INSERT INTO audit_events(id,organization_id,actor_user_id,action,target_type,target_id,details_json) VALUES(?,?,?,?,?,?,?)",
      )
      .bind(
        id("aud"),
        ORG,
        actor.id,
        `access_request.${requestStatus}`,
        "access_request",
        requestId,
        "{}",
      ),
  ]);
  return new Response(null, {
    status: 303,
    headers: { location: "/approvals", "cache-control": "no-store", "x-request-id": correlationId },
  });
};
export default {
  async fetch(request, env) {
    const correlationId = crypto.randomUUID(),
      url = new URL(request.url),
      db = env.IDENTITY_DB;
    try {
      if (url.pathname === "/health")
        return json({ ok: true, environment: env.ENVIRONMENT });
      if (url.pathname === "/auth/session") {
        let stage = "access_jwt_verification";
        try {
          const a = await accessIdentity(request, env);
          stage = "identity_resolution";
          const u = await upsert(db, a);
          stage = "application_session_creation";
          const token = crypto.randomUUID() + crypto.randomUUID(),
            ttl = Number(env.SESSION_TTL_SECONDS || 28800);
          await db
            .prepare(
              "INSERT INTO application_sessions(id_hash,user_id,expires_at) VALUES(?,?,datetime('now',?))",
            )
            .bind(await hash(token), u.id, `+${ttl} seconds`)
            .run();
          stage = "audit_write";
          await audit(db, u.id, "session.created", "user", u.id);
          console.log(
            JSON.stringify({
              event: "auth_session_bootstrap",
              status: "success",
              correlationId,
            }),
          );
          return new Response(null, {
            status: 302,
            headers: {
              location: "/",
              "set-cookie": `scouthq_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${ttl}`,
              "cache-control": "no-store",
              "x-request-id": correlationId,
            },
          });
        } catch (error) {
          console.error(
            JSON.stringify({
              event: "auth_session_bootstrap",
              status: "failed",
              category: error.category || stage,
              correlationId,
            }),
          );
          return page(
            "Sign-in problem",
            `<section class="card"><h1>We couldn’t finish signing you in</h1><p>Please return to ScoutHQ and try again. If this continues, share reference <strong>${correlationId}</strong> with Pack support.</p><a class="button" href="/">Return to ScoutHQ</a></section>`,
            error.status || 500,
          );
        }
      }
      if (url.pathname === "/logout") {
        await revokeApplicationSession(request, db);
        return new Response(null, {
          status: 302,
          headers: {
            location: "/",
            "set-cookie": clearedSessionCookie,
            "cache-control": "no-store",
          },
        });
      }
      if (url.pathname === "/switch-account") {
        if (env.ENVIRONMENT !== "staging") return json({ error: "Not found" }, 404);
        await revokeApplicationSession(request, db);
        console.log(
          JSON.stringify({
            event: "account_switch_started",
            status: "success",
            correlationId,
          }),
        );
        return new Response(null, {
          status: 302,
          headers: {
            location: `${url.origin}/cdn-cgi/access/logout`,
            "set-cookie": clearedSessionCookie,
            "cache-control": "no-store",
            "x-request-id": correlationId,
          },
        });
      }
      if (url.pathname === "/api/onboarding" && request.method === "POST") {
        return submitOnboarding(request, env, correlationId);
      }
      if (url.pathname === "/") {
        const u = await session(request, db);
        if (!u)
          return page(
            "Sign in",
            '<section class="card"><h1>Welcome to ScoutHQ</h1><p>Sign in with Google to continue or begin first-time Pack access.</p><a class="button" href="/auth/session">Continue with Google</a></section>',
          );
        const c = await buildAuthorizationContext(db, u.id, ORG);
        if (!c.membership) return onboardingForm(u);
        if (c.membership.status === "pending") {
          const household = await db
            .prepare(
              "SELECT h.display_name FROM household_members hm JOIN households h ON h.id=hm.household_id WHERE hm.user_id=? AND hm.active=1 ORDER BY hm.created_at LIMIT 1",
            )
            .bind(u.id)
            .first();
          return page(
            "Pending access",
            `<section class="card"><h1>Your Pack 321 access request has been submitted</h1><p>Your household information has been saved. A Pack 321 leader will review your request. You can return here to check your status.</p>${household ? `<dl><dt>Family</dt><dd><strong>${html(household.display_name)}</strong></dd><dt>Status</dt><dd><strong>Pending review</strong></dd></dl>` : ""}${accountActions}</section>`,
          );
        }
        if (c.membership.status !== "approved")
          return page(
            "Access unavailable",
            `<section class="card"><h1>Access unavailable</h1><p class="danger">Your Pack membership is not active.</p>${accountActions}</section>`,
            403,
          );
        return new Response(null, { status: 302, headers: { location: "/" } });
      }
      const u = await requireSession(request, env),
        c = await buildAuthorizationContext(db, u.id, ORG);
      if (url.pathname === "/api/context") {
        const context = await loadAppContext(db, u, url.pathname);
        return json({
          currentUser: context.user,
          organization: context.organization,
          membership: context.membership,
          roles: context.roles,
          permissions: context.permissions,
          authorizedHouseholdIds: context.householdIds,
          household: context.household,
          dependents: context.dependents,
          pendingApprovalCount: context.pendingCount,
          foundingOrganizationMode: context.foundingOrganizationMode,
          preferences: context.preferences,
        });
      }
      if (url.pathname === "/api/preferences" && request.method === "GET") return json({ preferences: await loadUserPreferences(db, u) });
      if (url.pathname === "/api/preferences" && request.method === "PUT") return json({ preferences: await updateUserPreferences(request, env, u) });
      if (url.pathname === "/api/access-requests" && request.method === "GET") {
        requirePermission(c, "access_requests.review");
        return json({ requests: await listPendingAccessRequests(db) });
      }
      const apiApprovalMatch = url.pathname.match(
        /^\/api\/access-requests\/([^/]+)\/(approve|needs-information|deny)$/,
      );
      if (apiApprovalMatch && request.method === "POST") {
        return reviewAccessRequest(
          request,
          env,
          decodeURIComponent(apiApprovalMatch[1]),
          apiApprovalMatch[2],
          correlationId,
        );
      }
      const approvalMatch = url.pathname.match(/^\/leadership\/approvals\/([^/]+)\/approve$/);
      if (approvalMatch && request.method === "POST") {
        return approveAccessRequest(request, env, decodeURIComponent(approvalMatch[1]), correlationId);
      }
      if (url.pathname === "/leadership/approvals") {
        requirePermission(c, "access_requests.review");
        return new Response(null, { status: 302, headers: { location: "/approvals" } });
      }
      const hm = url.pathname.match(/^\/api\/households\/([^/]+)$/);
      if (hm) {
        requireOwnHousehold(c, hm[1]);
        return json(
          await db
            .prepare(
              "SELECT id,display_name,status FROM households WHERE id=? AND organization_id=?",
            )
            .bind(hm[1], ORG)
            .first(),
        );
      }
      return json({ error: "Not found" }, 404);
    } catch (e) {
      const s = e.status || 500;
      console.error(
        JSON.stringify({
          event: "request_failed",
          category: e.category || "runtime_exception",
          correlationId,
          status: s,
        }),
      );
      if (request.headers.get("accept")?.includes("text/html"))
        return page(
          "Request problem",
          `<section class="card"><h1>ScoutHQ couldn’t complete that request</h1><p>Reference: ${correlationId}</p><a class="button" href="/">Return to ScoutHQ</a></section>`,
          s,
        );
      return json(
        {
          error:
            s === 401
              ? "Authentication required"
              : s === 403
                ? "Forbidden"
                : "Request failed",
          requestId: correlationId,
        },
        s,
      );
    }
  },
};
