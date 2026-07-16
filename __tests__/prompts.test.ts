import { describe, it, expect } from "vitest";
import { PROMPTS, promptFingerprint, getPrompt, type PromptId } from "../lib/ai/prompts";
import type { AIScene } from "../lib/types";

describe("prompts registry", () => {
  it("所有 prompt 都有 id / version / system / changelog / scene", () => {
    for (const [key, def] of Object.entries(PROMPTS)) {
      expect(def.id, `${key}.id`).toBe(key);
      expect(def.version, `${key}.version`).toMatch(/^v\d+$/);
      expect(typeof def.system, `${key}.system`).toBe("string");
      expect(def.system.length, `${key}.system 非空`).toBeGreaterThan(10);
      expect(typeof def.changelog, `${key}.changelog`).toBe("string");
      expect(def.scene, `${key}.scene`).toBeDefined();
    }
  });

  it("scene 与 promptId 一一对应", () => {
    for (const [key, def] of Object.entries(PROMPTS)) {
      expect(def.scene, `${key} 的 scene 应等于其 id`).toBe(key);
    }
  });

  it("promptFingerprint 返回 promptId:version:hash 格式", () => {
    const fp = promptFingerprint("knowledge_decompose", "v1");
    expect(fp).toMatch(/^knowledge_decompose:v1:[0-9a-f]+$/);
  });

  it("相同 prompt 内容产生相同指纹", () => {
    const fp1 = promptFingerprint("question_generate", "v1");
    const fp2 = promptFingerprint("question_generate", "v1");
    expect(fp1).toBe(fp2);
  });

  it("不同 prompt 产生不同指纹", () => {
    const fp1 = promptFingerprint("knowledge_decompose", "v1");
    const fp2 = promptFingerprint("question_generate", "v1");
    expect(fp1).not.toBe(fp2);
  });

  it("相同 prompt 不同版本号产生不同指纹", () => {
    const fp1 = promptFingerprint("knowledge_decompose", "v1");
    const fp2 = promptFingerprint("knowledge_decompose", "v2");
    expect(fp1).not.toBe(fp2);
  });

  it("getPrompt 返回 system / version / fingerprint / scene", () => {
    const result = getPrompt("daily_nudge");
    expect(result.system).toBe(PROMPTS.daily_nudge.system);
    expect(result.version).toBe(PROMPTS.daily_nudge.version);
    expect(result.scene).toBe("daily_nudge" as AIScene);
    expect(result.fingerprint).toBe(promptFingerprint("daily_nudge", PROMPTS.daily_nudge.version));
  });

  it("weekly_report 包含 {emotion_section} 占位符", () => {
    expect(PROMPTS.weekly_report.system).toContain("{emotion_section}");
  });

  it("所有 promptId 都能通过 getPrompt 取到", () => {
    const ids = Object.keys(PROMPTS) as PromptId[];
    for (const id of ids) {
      const result = getPrompt(id);
      expect(result.system.length).toBeGreaterThan(0);
      expect(result.fingerprint.startsWith(`${id}:`)).toBe(true);
    }
  });
});

/**
 * Prompt 版本一致性快照（CI 强制校验）
 *
 * 解决的问题（Issue 7）：
 *   promptFingerprint(id, version) 虽然包含 content hash，但 version 是字符串、手动维护。
 *   如果有人改了 system prompt 但忘了 bump version，hash 部分会变而 version 不变，
 *   历史记录里就会出现「同 version 不同 hash」的指纹，归因就断了。
 *
 * 维护规则（必读）：
 *   1. 修改任何 PROMPTS[id].system 内容时，必须 bump PROMPTS[id].version（v1→v2）
 *   2. 同时把下面 PROMPT_VERSION_HASHES[id] 的值更新为新计算出的 "version:hash"
 *      —— 运行 `npx vitest run __tests__/prompts.test.ts` 看失败信息里的「实际值」直接复制
 *   3. 新增 prompt 时，必须在 PROMPT_VERSION_HASHES 中添加对应条目，否则
 *      "快照必须覆盖所有 prompt" 这条测试会失败
 *
 * 这套机制等价于「内容指纹 + 版本号双绑定」：
 *   - 改内容不改 version → hash 不匹配 → 失败
 *   - 改 version 不更新快照 → version 不匹配 → 失败
 *   - 两者都改但内容其实没变 → hash 不匹配 → 失败（防止虚假 bump）
 */
const PROMPT_VERSION_HASHES: Record<PromptId, string> = {
  knowledge_decompose: "v2:8bbf3f1f",
  question_generate: "v2:9fa46437",
  daily_nudge: "v2:a7f4c7ac",
  chat: "v2:907e6216",
  adjust_plan: "v2:3d72527b",
  energy_pattern: "v1:153156ef",
  emotion_coping: "v1:dd1d7097",
  status_enhance: "v1:4c1e3c92",
  weekly_report: "v1:dc5b669c",
};

describe("prompt 版本一致性（CI 强制校验）", () => {
  it("快照必须覆盖所有 prompt，不多不少", () => {
    const snapshotIds = Object.keys(PROMPT_VERSION_HASHES).sort();
    const registryIds = Object.keys(PROMPTS).sort();
    expect(snapshotIds, "PROMPT_VERSION_HASHES 的 key 必须与 PROMPTS 一一对应").toEqual(registryIds);
  });

  it("修改 prompt 内容必须 bump version 并同步更新快照", () => {
    for (const id of Object.keys(PROMPTS) as PromptId[]) {
      const def = PROMPTS[id];
      const fp = promptFingerprint(id, def.version);
      // fp 格式："promptId:version:hash"，取后两段
      const actual = fp.split(":").slice(1).join(":");
      const expected = PROMPT_VERSION_HASHES[id];
      const msg =
        `\n  [${id}] prompt 版本指纹与快照不一致\n` +
        `    实际: ${actual}\n` +
        `    快照: ${expected}\n\n` +
        `  如果修改了 ${id} 的 system 内容：\n` +
        `    1. 在 lib/ai/prompts.ts 中 bump ${id}.version（如 v1→v2）\n` +
        `    2. 将上面的「实际」值复制到本文件的 PROMPT_VERSION_HASHES["${id}"]\n` +
        `  如果只是回退了内容，把快照值改成「实际」值即可。`;
      expect(actual, msg).toBe(expected);
    }
  });

  it("version 字段格式必须是 vX（X 为正整数）", () => {
    for (const id of Object.keys(PROMPT_VERSION_HASHES) as PromptId[]) {
      const version = PROMPT_VERSION_HASHES[id].split(":")[0];
      expect(version, `${id} 的 version 应为 vX 格式`).toMatch(/^v\d+$/);
    }
  });
});
