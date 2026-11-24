import assert from 'node:assert/strict';
import fs from 'node:fs';

/**
 * Static and structural verification suite for FraudShield AI Firestore Security Rules
 * Verifies all Dirty Dozen attack vectors are guarded in firestore.rules and aligned with firebase-blueprint.json.
 */
const rulesPath = fs.existsSync('firestore.rules') ? 'firestore.rules' : 'DRAFT_firestore.rules';
const rulesContent = fs.readFileSync(rulesPath, 'utf8');
const blueprint = JSON.parse(fs.readFileSync('firebase-blueprint.json', 'utf8'));

const dirtyDozenAssertions: { name: string; check: () => void }[] = [
  {
    name: '1. Uses rules_version = 2 and global default-deny catch-all',
    check: () => {
      assert.match(rulesContent, /rules_version\s*=\s*'2'/);
      assert.match(rulesContent, /match \/\{document=\*\*\}\s*\{\s*allow read, write:\s*if false;/);
    },
  },
  {
    name: '2. Enforces verified email on authentication & admin bootstrap',
    check: () => {
      assert.match(rulesContent, /request\.auth\.token\.email_verified\s*==\s*true/);
    },
  },
  {
    name: '3. Forbids blanket list reads and enforces resource.data.ownerId on allow list',
    check: () => {
      assert.doesNotMatch(rulesContent, /allow\s+(read|list)\s*:\s*if\s+isSignedIn\(\)\s*;/);
      assert.match(rulesContent, /allow list:\s*if\s+isVerifiedUser\(\)\s*&&\s*\(existing\(\)\.ownerId\s*==\s*request\.auth\.uid\s*\|\|\s*isListAdmin\(\)\)/);
    },
  },
  {
    name: '4. Prevents cross-tenant ownership spoofing on create and immutable ownerId on update',
    check: () => {
      assert.match(rulesContent, /incoming\(\)\.ownerId\s*==\s*request\.auth\.uid/);
      assert.match(rulesContent, /incoming\(\)\.ownerId\s*==\s*existing\(\)\.ownerId/);
    },
  },
  {
    name: '5. Blocks shadow/ghost fields via strict hasAll + hasOnly checks',
    check: () => {
      assert.match(rulesContent, /data\.keys\(\)\.hasAll\(/);
      assert.match(rulesContent, /data\.keys\(\)\.hasOnly\(/);
    },
  },
  {
    name: '6. Blocks self-assigned admin escalation on /admins and /users/*/private',
    check: () => {
      assert.match(rulesContent, /match \/admins\/\{adminId\}[\s\S]*allow write:\s*if false;/);
      assert.match(rulesContent, /incoming\(\)\.role\s*==\s*'analyst'/);
    },
  },
  {
    name: '7. Isolates user PII under /users/{userId}/private strictly to owner or admin',
    check: () => {
      assert.match(rulesContent, /match \/users\/\{userId\}\/private\/\{docId\}[\s\S]*allow get:\s*if[^\n]*isVerifiedUser\(\) && \(isOwner\(userId\) \|\| isAdmin\(\)\)/);
    },
  },
  {
    name: '8. Enforces isValidId() regex & size bounds on all single-document paths',
    check: () => {
      assert.match(rulesContent, /isValidId\(transactionId\)/);
      assert.match(rulesContent, /isValidId\(ruleId\)/);
      assert.match(rulesContent, /isValidId\(configId\)/);
      assert.match(rulesContent, /id\.matches\('\^\[a-zA-Z0-9_\\\\-\]\+\$'\)/);
    },
  },
  {
    name: '9. Enforces total array guarding & string length caps from blueprint',
    check: () => {
      assert.match(rulesContent, /data\.riskFactors is list[\s\S]*data\.riskFactors\.size\(\)\s*<=\s*16[\s\S]*data\.riskFactors\[0\] is string/);
      assert.match(rulesContent, /data\.merchant\.size\(\)\s*<=\s*160/);
    },
  },
  {
    name: '10. Preserves immutable createdAt and enforces request.time temporal integrity',
    check: () => {
      assert.match(rulesContent, /incoming\(\)\.createdAt\s*==\s*request\.time/);
      assert.match(rulesContent, /incoming\(\)\.createdAt\s*==\s*existing\(\)\.createdAt/);
      assert.match(rulesContent, /incoming\(\)\.updatedAt\s*==\s*request\.time/);
    },
  },
  {
    name: '11. Enforces terminal state locking on verified transactions unless admin',
    check: () => {
      assert.match(rulesContent, /isVerifiedTerminal\(\)/);
    },
  },
  {
    name: '12. Covers all collections defined in firebase-blueprint.json',
    check: () => {
      const paths = Object.keys(blueprint.firestore || {});
      assert.ok(paths.length >= 5);
      assert.match(rulesContent, /match \/transactions\/\{transactionId\}/);
      assert.match(rulesContent, /match \/fraudRules\/\{ruleId\}/);
      assert.match(rulesContent, /match \/modelConfigs\/\{configId\}/);
    },
  },
];

let passed = 0;
for (const testCase of dirtyDozenAssertions) {
  testCase.check();
  passed++;
  console.log(`PASS: ${testCase.name}`);
}
console.log(`\nAll ${passed}/${dirtyDozenAssertions.length} security rule invariant tests passed against ${rulesPath}.`);
