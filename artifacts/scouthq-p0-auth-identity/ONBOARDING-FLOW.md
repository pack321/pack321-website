# Onboarding and Approval Flow

Verified new identity → ScoutHQ user → normalized Family Last Name → preliminary household and guardian link → pending Pack 321 membership → access request → submission audit → pending screen → permission-checked Leadership approval → approved membership → active Parent / Guardian role → active household → approval audit → approved Parent My Day.

The onboarding write and approval transition each use an atomic D1 batch. Idempotency indexes prevent duplicate active guardian links, duplicate open access requests, duplicate active role assignments, and duplicate approval audits.

Real-browser validation completed with Griffin Family. The request appeared once in the Leadership queue, was approved once, disappeared from pending, and remained preserved historically as approved.
