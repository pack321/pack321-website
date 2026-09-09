import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  requireApproved,
  requireOwnHousehold,
  requirePermission,
} from "../src/authorization.mjs";
import { familyDisplayName, normalizeFamilyLastName } from "../src/onboarding.mjs";
const denied = (fn) => assert.throws(fn, (e) => e.status === 403);
denied(() => requireApproved(null));
denied(() => requireApproved({ membership: { status: "pending" } }));
requireApproved({ membership: { status: "approved" } });
denied(() =>
  requirePermission(
    { membership: { status: "approved" }, permissions: ["household.read.own"] },
    "people.read",
  ),
);
requirePermission(
  {
    membership: { status: "approved" },
    permissions: ["access_requests.review"],
  },
  "access_requests.review",
);
requireOwnHousehold(
  {
    membership: { status: "approved" },
    permissions: ["household.read.own"],
    householdIds: ["hh-own"],
  },
  "hh-own",
);
denied(() =>
  requireOwnHousehold(
    {
      membership: { status: "approved" },
      permissions: ["household.read.own"],
      householdIds: ["hh-own"],
    },
    "hh-other",
  ),
);
requireOwnHousehold(
  {
    membership: { status: "approved" },
    permissions: ["people.read"],
    householdIds: [],
  },
  "hh-other",
);
const workerSource = await readFile(
  new URL("../src/index.mjs", import.meta.url),
  "utf8",
);
assert.match(workerSource, /url\.pathname === "\/logout"/);
assert.match(workerSource, /url\.pathname === "\/switch-account"/);
assert.match(workerSource, /\/cdn-cgi\/access\/logout/);
assert.match(workerSource, /env\.ENVIRONMENT !== "staging"/);
assert.match(workerSource, /HttpOnly; Secure; SameSite=Lax; Max-Age=0/);
assert.match(workerSource, />Switch account</);
assert.equal(normalizeFamilyLastName("griffin"), "Griffin");
assert.equal(normalizeFamilyLastName("GRIFFIN"), "Griffin");
assert.equal(normalizeFamilyLastName("  Griffin  "), "Griffin");
assert.equal(normalizeFamilyLastName("o'connor"), "O'Connor");
assert.equal(normalizeFamilyLastName("smith-jones"), "Smith-Jones");
assert.equal(normalizeFamilyLastName("McDonald"), "McDonald");
assert.equal(normalizeFamilyLastName("de  la cruz"), "De La Cruz");
assert.equal(familyDisplayName("Griffin"), "Griffin Family");
assert.throws(() => normalizeFamilyLastName("   "), (error) => error.status === 400);
assert.match(workerSource, /await db\.batch\(statements\)/);
assert.match(workerSource, /access_request\.submitted/);
assert.match(workerSource, /access_requests\.review/);
assert.match(workerSource, /access_request\.approved/);
assert.match(workerSource, /resultingRole: "parent_guardian"/);
assert.match(workerSource, /env\.ENVIRONMENT !== "staging"/);
assert.match(workerSource, /location: "\/approvals"/);
assert.match(workerSource, /\/api\/access-requests/);
assert.match(workerSource, /\/api\/context/);
assert.match(workerSource, /loadAppContext/);
assert.match(workerSource, /url\.pathname === "\/api\/preferences"/);
assert.match(workerSource, /updateUserPreferences/);
assert.match(workerSource, /requireSameOriginPost\(request\)/);
assert.match(workerSource, /"user_id"/);
assert.match(workerSource, /user\.profile\.updated/);
assert.match(workerSource, /preferred_name/);
console.log("ScoutHQ authorization policy tests passed.");
