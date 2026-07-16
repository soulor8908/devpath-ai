import { describe, it, expect } from "vitest";
import {
  selectPersona,
  getUserPersona,
  getPersonaSnippet,
  PERSONAS,
  PERSONA_LIST,
  type PersonaContext,
} from "../lib/ai/persona";
import type { PersonaId, UserProfile } from "../lib/types";

// ============ selectPersona：4 种 Persona 触发条件 ============

describe("selectPersona", () => {
  it("energy ≤ 2 → gentle_companion（低能量优先共情）", () => {
    const ctx: PersonaContext = {
      energy: 2,
      mood: "neutral",
      streak: 5,
      topic: "今天学什么",
    };
    expect(selectPersona(ctx).id).toBe("gentle_companion");
  });

  it("mood === 'bad' → gentle_companion（情绪低落优先共情，即便能量不低）", () => {
    const ctx: PersonaContext = {
      energy: 4,
      mood: "bad",
      streak: 5,
      topic: "随便聊聊",
    };
    expect(selectPersona(ctx).id).toBe("gentle_companion");
  });

  it("energy = 1 → gentle_companion（极低能量）", () => {
    const ctx: PersonaContext = {
      energy: 1,
      mood: "good",
      streak: 10,
    };
    expect(selectPersona(ctx).id).toBe("gentle_companion");
  });

  it("topic 含深度技术关键词 → socratic_tutor（引导思考）", () => {
    const ctx: PersonaContext = {
      energy: 3,
      mood: "neutral",
      streak: 5,
      topic: "请解释一下 React Fiber 架构和它的调度原理",
    };
    expect(selectPersona(ctx).id).toBe("socratic_tutor");
  });

  it("topic 含英文技术关键词 → socratic_tutor", () => {
    const ctx: PersonaContext = {
      energy: 3,
      mood: "neutral",
      streak: 5,
      topic: "How does the event loop work in JavaScript?",
    };
    expect(selectPersona(ctx).id).toBe("socratic_tutor");
  });

  it("energy ≥ 4 且 streak < 3 → strict_coach（高能量但落后）", () => {
    const ctx: PersonaContext = {
      energy: 5,
      mood: "good",
      streak: 2,
      topic: "今天学什么",
    };
    expect(selectPersona(ctx).id).toBe("strict_coach");
  });

  it("energy = 4 且 streak = 0 → strict_coach（落后明显）", () => {
    const ctx: PersonaContext = {
      energy: 4,
      mood: "good",
      streak: 0,
    };
    expect(selectPersona(ctx).id).toBe("strict_coach");
  });

  it("默认 → peer_dev（平等同行）", () => {
    const ctx: PersonaContext = {
      energy: 3,
      mood: "neutral",
      streak: 5,
      topic: "今天天气不错",
    };
    expect(selectPersona(ctx).id).toBe("peer_dev");
  });

  it("energy ≥ 4 且 streak ≥ 3 → peer_dev（高能量但已稳定）", () => {
    const ctx: PersonaContext = {
      energy: 5,
      mood: "good",
      streak: 10,
      topic: "今天学什么",
    };
    expect(selectPersona(ctx).id).toBe("peer_dev");
  });

  it("优先级链：gentle_companion > socratic_tutor", () => {
    // energy 低 + 深度技术问题 → gentle_companion 优先（先共情）
    const ctx: PersonaContext = {
      energy: 2,
      mood: "neutral",
      streak: 5,
      topic: "请讲讲事件循环的原理",
    };
    expect(selectPersona(ctx).id).toBe("gentle_companion");
  });

  it("优先级链：socratic_tutor > strict_coach", () => {
    // 深度技术问题 + 高能量 + streak 低 → socratic_tutor 优先（先引导思考）
    const ctx: PersonaContext = {
      energy: 5,
      mood: "good",
      streak: 0,
      topic: "讲讲虚拟机的内存模型",
    };
    expect(selectPersona(ctx).id).toBe("socratic_tutor");
  });
});

// ============ getUserPersona：preferredPersona 覆盖 ============

describe("getUserPersona", () => {
  it("preferredPersona 存在 → 直接返回该 persona（覆盖自动选择）", () => {
    const profile: UserProfile = {
      id: "ai:profile",
      skillLevel: {},
      accuracyByNode: {},
      preferredTimeSlots: [],
      averageSessionMinutes: 0,
      goals: { short: [], mid: [], long: [] },
      preferredPersona: "strict_coach",
      updatedAt: "2026-07-16T00:00:00.000Z",
    };
    // 即便 ctx 指向 gentle_companion，preferredPersona 覆盖
    const ctx: PersonaContext = {
      energy: 1,
      mood: "bad",
      streak: 0,
    };
    expect(getUserPersona(profile, ctx).id).toBe("strict_coach");
  });

  it("无 preferredPersona + ctx → selectPersona(ctx) 自动选择", () => {
    const profile: UserProfile = {
      id: "ai:profile",
      skillLevel: {},
      accuracyByNode: {},
      preferredTimeSlots: [],
      averageSessionMinutes: 0,
      goals: { short: [], mid: [], long: [] },
      updatedAt: "2026-07-16T00:00:00.000Z",
    };
    const ctx: PersonaContext = {
      energy: 2,
      mood: "neutral",
      streak: 5,
    };
    expect(getUserPersona(profile, ctx).id).toBe("gentle_companion");
  });

  it("无 profile + ctx → selectPersona(ctx) 自动选择", () => {
    const ctx: PersonaContext = {
      energy: 5,
      mood: "good",
      streak: 0,
    };
    expect(getUserPersona(null, ctx).id).toBe("strict_coach");
  });

  it("无 profile + 无 ctx → peer_dev（默认）", () => {
    expect(getUserPersona(undefined, undefined).id).toBe("peer_dev");
  });

  it("无 preferredPersona + 无 ctx → peer_dev（默认）", () => {
    const profile: UserProfile = {
      id: "ai:profile",
      skillLevel: {},
      accuracyByNode: {},
      preferredTimeSlots: [],
      averageSessionMinutes: 0,
      goals: { short: [], mid: [], long: [] },
      updatedAt: "2026-07-16T00:00:00.000Z",
    };
    expect(getUserPersona(profile, undefined).id).toBe("peer_dev");
  });

  it("preferredPersona = peer_dev 时不会被自动选择覆盖", () => {
    const profile: UserProfile = {
      id: "ai:profile",
      skillLevel: {},
      accuracyByNode: {},
      preferredTimeSlots: [],
      averageSessionMinutes: 0,
      goals: { short: [], mid: [], long: [] },
      preferredPersona: "peer_dev",
      updatedAt: "2026-07-16T00:00:00.000Z",
    };
    const ctx: PersonaContext = {
      energy: 1,
      mood: "bad",
      streak: 0,
    };
    // 即便 ctx 指向 gentle_companion，preferredPersona=peer_dev 生效
    expect(getUserPersona(profile, ctx).id).toBe("peer_dev");
  });
});

// ============ getPersonaSnippet ============

describe("getPersonaSnippet", () => {
  it("返回 persona 的 snippet", () => {
    const persona = PERSONAS.strict_coach;
    const snippet = getPersonaSnippet(persona);
    expect(typeof snippet).toBe("string");
    expect(snippet.length).toBeGreaterThan(10);
    expect(snippet).toBe(persona.snippet);
  });

  it("4 种 persona 都有非空 snippet", () => {
    for (const persona of PERSONA_LIST) {
      const snippet = getPersonaSnippet(persona);
      expect(snippet.length, `${persona.id}.snippet 非空`).toBeGreaterThan(10);
    }
  });
});

// ============ PERSONA_LIST 与 PERSONAS 一致性 ============

describe("PERSONA_LIST", () => {
  it("包含 4 种 Persona", () => {
    expect(PERSONA_LIST.length).toBe(4);
  });

  it("覆盖所有 PersonaId", () => {
    const ids = new Set(PERSONA_LIST.map((p) => p.id));
    const expected: PersonaId[] = [
      "strict_coach",
      "gentle_companion",
      "socratic_tutor",
      "peer_dev",
    ];
    for (const id of expected) {
      expect(ids.has(id), `PERSONA_LIST 缺少 ${id}`).toBe(true);
    }
  });
});
