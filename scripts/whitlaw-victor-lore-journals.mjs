/**
 * 猎杀对决 · 惠特劳侦察报告 / 奥蒂斯书信 / 约翰·维克多文献（Ephemera）
 * - 侦察报告 1–6（致惠特劳中校）
 * - 致奥蒂斯的信（原报告 7 起，至第四章）
 * - 约翰·维克多写给你的信
 * - 约翰·维克多的手册
 */

import {
  esc,
  emptyBlocks,
  chunkSegmentsByChars,
  padBookPagesEven,
  buildEphemeraBookDocument,
  buildEphemeraLetterDocument,
  buildJournalEntryFromDocument,
  createEphemeraBookInWorld,
} from "./ephemera-journal-util.mjs";

const SOURCE = "Hunt: Showdown — Whitlaw / John Victor Lore";

const BODY =
  "font-family:Georgia,'Songti SC',SimSun,serif;font-size:1.08rem;line-height:1.85;color:#1a120c;text-align:justify;";
const HEAD =
  "margin:0 0 0.75rem;font-size:1.22rem;font-weight:700;letter-spacing:0.06em;color:#2a1408;border-bottom:1px solid rgba(60,35,20,0.35);padding-bottom:0.28rem;";
const META =
  "margin:0 0 0.75rem;font-size:0.9rem;line-height:1.5;color:#5a4030;font-style:italic;";
const PARA = "margin:0 0 0.8rem;line-height:1.85;text-align:justify;";
const ORNAMENT =
  "margin:0 0 0.85rem;text-align:center;font-size:0.88rem;letter-spacing:0.35em;color:#6a4a30;opacity:0.85;";
const PAGE_CHARS = 340;

function parasHtml(list) {
  return list.map((p) => `<p style="${PARA}">${esc(p)}</p>`).join("");
}

function bookPage(title, inner) {
  return {
    title,
    flowContent: `<div style="${BODY}"><p style="${ORNAMENT}">✦ &nbsp;—&nbsp; ✦</p>${inner}</div>`,
  };
}

function sectionPages({ title, meta, paragraphs, maxChars = PAGE_CHARS }) {
  const chunks = chunkSegmentsByChars(
    paragraphs.map((text) => ({ kind: "p", text })),
    maxChars
  );
  return chunks.map((segs, i) => {
    const heading = i === 0 ? title : `${title}（续）`;
    const head =
      i === 0
        ? `<p style="${HEAD}">${esc(title)}</p>${
            meta ? `<p style="${META}">${esc(meta)}</p>` : ""
          }`
        : `<p style="${META}">${esc(heading)}</p>`;
    return bookPage(heading, `${head}${parasHtml(segs.map((s) => s.text))}`);
  });
}

async function finishBook({ title, pages, coverColor, agingSeed, journalId, handoutId, img }) {
  pages = padBookPagesEven(
    pages,
    `<div style="${BODY}"><p style="${ORNAMENT}">✦</p></div>`
  );
  const document = await buildEphemeraBookDocument({
    title,
    pages,
    template: "old-book",
    bookLabels: {
      appearance: {
        coverColor,
        colorStrength: 46,
        gloss: 28,
        leather: 55,
        aging: 50,
      },
    },
    effects: { yellowing: 46, aging: 44, grain: 20, ink: 36, agingSeed },
  });
  document.pages = pages.map((src, i) => ({
    ...(document.pages[i] ?? { id: `page-${i + 1}`, ...emptyBlocks() }),
    title: src.title,
    flowContent: src.flowContent,
  }));
  return { document, journalId, handoutId, title, img };
}

/* -------------------------------------------------------------------------- */
/* 1) 侦察报告 1–6                                                              */
/* -------------------------------------------------------------------------- */

const SCOUT_REPORTS = [
  {
    title: "侦察报告 1",
    meta: "致惠特劳中校",
    paragraphs: [
      "1896年6月1日，我们抵达了目标地点。我们发现了战斗的痕迹。伤亡惨重。绷带散落一地。传言得到证实：死者正在行走，皮肤像桦树皮一样剥落。",
      "我们目睹了多名武装精良的战斗人员交战。其中三人幸存并逃跑。我们循着他们的踪迹，在一座废弃的狩猎塔内建立了营地，以便绘制该区域的地图，但我们却遭到了袭击。",
      "我们遇到了前列兵格里兹·莱文森。他告诉我们关于猎人和防止他们堕落成恶魔的疫苗。我们决定，这些疫苗能提高我们完成任务的几率。",
    ],
  },
  {
    title: "侦察报告 2",
    meta: "致惠特劳中校",
    paragraphs: [
      "健康的居民已不复存在，只剩下病人。他们无法说话，步履蹒跚，只有吃马肉时才会停下来。声音会引起他们的注意和愤怒，但他们很容易被杀死。目前还没有找到原因。听说有更可怕的怪物出现。我会继续追踪，寻找更多线索。",
      "这种注射能保护我们免受感染，但它的副作用是令人迷失方向。它被称为「黑暗视觉」，因为在黑暗中，蓝色的萤火虫会帮助我们追踪最凶残的恶魔。自从列文森下士注射后，我们都出现了恶心、眩晕和失眠的症状。他嘲笑我们的担忧。但我们现在所见所闻足以让我们明白这种疗法的必要性。",
    ],
  },
  {
    title: "侦察报告 3",
    meta: "致惠特劳中校",
    paragraphs: [
      "我们已经确定，这里的人，被称为猎人，聚集在一起猎杀最大的恶魔，并从它们的尸体上领取赏金。我犹豫要不要描述我们发现的东西。说实话，中校长官，我恶心头痛，很难客观地描述任何事情。虽然我们一直以来都只汇报我们亲眼所见，但任何一个理智的人都不会相信我们。您真的能相信我们发现了一团笨重的肉块，上面缝着一个腐烂的猪头吗？您真的能相信我们杀死了它，听到了嚎叫声，它的尸体上闪烁着闪电吗？",
      "这里是我们第一次经历驱逐的地方。驱逐结束后，尸体消失了，只留下一个令人毛骨悚然的信物。这就是猎人们来到这里的原因。一个信物价值连城。我们至今仍不清楚是谁提供这些赏金，也不知道原因。AHA（美国猎人协会）是条死路。目前，我们把信物给了格里兹，他负责供养我们。",
    ],
  },
  {
    title: "侦察报告 4",
    meta: "致惠特劳中校",
    paragraphs: [
      "研究猎人们的动机很有意义。有些人是为了正义而战，真心希望恢复这片地区的和平。但许多人只是为了中饱私囊，或是因为享受猎杀同类的快感。只要腐败持续下去，他们就能获得丰厚的报酬和充足的食物。这使得人数较少的其他人的使命更加难以实现。",
      "关于此事，我们只能恳请你们增援。猎人们与这种所谓的腐化势力已经战斗了一年多，但它依然存在。我们需要更强大的力量。做好遭遇抵抗的准备。",
      "我们建议你们在准备期间不要试图联系前列兵莱文森。他试图毒害我们。我们和他发生了冲突，把他赶走了。",
    ],
  },
  {
    title: "侦察报告 5",
    meta: "致惠特劳中校　字迹颤抖，纸上沾着血淋淋的黑发",
    paragraphs: [
      "是黑暗的瘴气，还是昆虫的叮咬？感染会通过声音传播吗？苍蝇的嗡嗡声扰乱了我的睡眠。我听到它们令人作呕的腿在窗台上敲击的声音。我的皮肤感到一阵阵发麻。没有一丝解脱。但我们已经熟练掌握了消灭猎手的技巧。以眼还眼。我的鞍袋装满了东西。蜘蛛网，苍蝇的坟墓。一层又一层，不停地包裹着。只有飞蛾是安静的，温柔的，令人感到一丝慰藉。",
    ],
  },
  {
    title: "侦察报告 6",
    meta: "致惠特劳中校",
    paragraphs: [
      "请忽略之前的报告。任务进展稳定，未发现感染者，一切进展顺利。",
    ],
  },
];

export async function buildScoutReportsDocument() {
  const pages = SCOUT_REPORTS.flatMap((r) => sectionPages(r));
  const built = await finishBook({
    title: "侦察报告 · 致惠特劳中校",
    pages,
    coverColor: "#2c3a2e",
    agingSeed: 1896,
    journalId: "whbHuntScoutRp01",
    handoutId: "whbHuntScoutRpH1",
    img: "icons/sundries/documents/document-sealed-signatures-red.webp",
  });
  return built.document;
}

export async function buildScoutReportsJournalDoc() {
  const document = await buildScoutReportsDocument();
  return buildJournalEntryFromDocument({
    journalId: "whbHuntScoutRp01",
    handoutPageId: "whbHuntScoutRpH1",
    title: "侦察报告 · 致惠特劳中校",
    img: "icons/sundries/documents/document-sealed-signatures-red.webp",
    source: SOURCE,
    document,
  });
}

export async function createScoutReportsBook({ open = true } = {}) {
  return createEphemeraBookInWorld({
    title: "侦察报告 · 致惠特劳中校",
    document: await buildScoutReportsDocument(),
    source: SOURCE,
    open,
  });
}

/* -------------------------------------------------------------------------- */
/* 2) 致奥蒂斯的信                                                              */
/* -------------------------------------------------------------------------- */

const OTIS_LETTERS = [
  {
    title: "信 · 其一",
    meta: "折叠纸，约 8×8 英寸　致奥蒂斯",
    paragraphs: [
      "奥蒂斯，",
      "巡逻队问候。应该还要三天才能回来，到时候你得请我喝一杯。真不敢相信我居然被你说服了。我不喜欢列队行军。再说，这些人根本没料到这里会发生什么。第一个看到喷火兵的人差点吓尿了。我得替他开枪。但如果第26团真像他们说的那样有后援，那我最好还是加入他们，而不是替她跑腿。至少现在是这样。就像你说的，也许他们能扭转战局。他们看起来确实这么认为。有点狂妄，但有时候狂妄也是一种优势。",
      "——A",
    ],
  },
  {
    title: "信 · 其二",
    meta: "折叠纸，约 8×8 英寸　致奥蒂斯",
    paragraphs: [
      "奥蒂斯，",
      "我早就跟你说过什么来着？人们不喜欢这些军人插手，不管他们是不是叛徒。第26师以为他们能迅速赶到这里，一周之内解决我们打了一年多的仗。如果不是事情彻底搞砸了，这倒也挺滑稽的。",
      "说到这个，你真以为海耶斯会加入我们？那个工会成员？凯特琳也拒绝了，他肯定很受伤。至于我，只要有足够强大的武器结束这一切，我就会站在哪一边。他们甚至还在做研究。我们昨天修好了气球，准备放出样本。",
      "布里奇沃特今天早上来了。我很高兴见到他，但他对惠特劳一点好感都没有。我看到他把惠特劳贴的海报都撕下来了。我倒也不怪他。",
      "——A",
    ],
  },
  {
    title: "信 · 其三",
    meta: "折叠纸，约 8×8 英寸　致奥蒂斯　译自沃尼奇手稿",
    paragraphs: [
      "奥蒂斯——别来见我。惠特洛到处都在监视你。你错过了康莉离开的那一刻。惠特洛命令她处决他们自己人。她说那人被感染了，但他看起来只是害怕。康莉拒绝了，惠特洛就朝她开了枪。营地里仍然一片混乱。",
      "不过，我宁愿选惠特劳也不要里金斯，尽管第二十六团有一半的人都希望他能接任。你见过他那些小祭坛吗？手指和耳朵堆成一摞？他说那是「为了胜利」。我发誓昨天我看到他啃着一根手指。躲到他那面具下面，消失不见了。",
      "希望你好好保管你的帽子。",
      "——A",
    ],
  },
  {
    title: "信 · 其四",
    meta: "折叠纸，约 8×8 英寸　致奥蒂斯　译自沃尼奇手稿",
    paragraphs: [
      "我偷偷把这东西带上气球出去了，但不知道它会落在哪里。希望你还活着能拿到它。没想到最后一波攻击来的时候，里金斯竟然把我们锁在堡垒里。其他人尖叫了好久。被困在外面的人很快就死了。不过被困在里面几乎更糟。我们没子弹了。不得不从城墙撤退到内院；怪物还在不断涌来。谁也不许离开。里金斯总是和他关起来研究的大怪物待在一起，不停地砍它。他不停地唱着进行曲，像唱圣歌一样。没人能忍受。他们在墙上写字。惠特洛因为有人哭就打死了四个。声称他们反对。",
      "心跳加速，但我感觉很平静。其他人崩溃得太快了。帮林奇跑腿办事对我来说或许是一种不同的训练。又或许，只是激起了我的斗志，让我坚持了下来。",
      "我看到一具尸体，不是惠特洛开的枪。他的双手被反绑在背后，嘴里塞满了腐肉。我想他是被噎死的。我听到有人在唱歌。",
      "奥蒂斯，如果你看到这条信息，请派人来帮忙。虽然天知道现在谁能帮我们，或者谁愿意帮我们。",
      "——A",
    ],
  },
  {
    title: "信 · 其五",
    meta: "折叠纸，约 8×8 英寸　致奥蒂斯",
    paragraphs: [
      "很高兴你从不抛弃战友，奥蒂斯。之前我碍于面子没说，但即便我和布里奇沃特逃出了内院，我也不确定我们还能走多远。幸好你和康利及时出现。我已经付清了她弹药和支援的费用。不过，你答应我付一半，我可不满意。",
      "我心里有点庆幸你没早点到。最后，惠特洛拿起一把斧头，劈开了一个对他忠心耿耿的年轻人。他说里金斯死后，每个人都像个叛徒，随时可能背叛他。好吧，这下真的应验了。我被捅了一刀，就是因为一开始我忍不住盯着那个可怜的孩子看。肺被撕裂的时候，呼吸声听起来很奇怪，就像孩子学吹口哨，或者气球漏气一样。",
      "我觉得我和布里奇沃特会继续设置悬赏机制。这可能是我最近想到的最好的主意了。",
      "——A.H.",
    ],
  },
];

export async function buildOtisLettersDocument() {
  const pages = [
    bookPage(
      "扉页",
      `<p style="${HEAD}">致奥蒂斯的信</p><p style="${META}">折叠信纸　约 8×8 英寸　署名 A / A.H.</p><p style="${PARA}">与惠特劳第26团溃败相关的私人通信。与正式侦察报告分册保存。</p>`
    ),
    ...OTIS_LETTERS.flatMap((r) => sectionPages(r)),
  ];
  const built = await finishBook({
    title: "致奥蒂斯的信",
    pages,
    coverColor: "#4a3424",
    agingSeed: 2601,
    journalId: "whbHuntOtisLt001",
    handoutId: "whbHuntOtisLtH01",
    img: "icons/sundries/documents/document-letter-sealed-brown.webp",
  });
  return built.document;
}

export async function buildOtisLettersJournalDoc() {
  return buildJournalEntryFromDocument({
    journalId: "whbHuntOtisLt001",
    handoutPageId: "whbHuntOtisLtH01",
    title: "致奥蒂斯的信",
    img: "icons/sundries/documents/document-letter-sealed-brown.webp",
    source: SOURCE,
    document: await buildOtisLettersDocument(),
  });
}

export async function createOtisLettersBook({ open = true } = {}) {
  return createEphemeraBookInWorld({
    title: "致奥蒂斯的信",
    document: await buildOtisLettersDocument(),
    source: SOURCE,
    open,
  });
}

/* -------------------------------------------------------------------------- */
/* 3) 约翰·维克多的信                                                           */
/* -------------------------------------------------------------------------- */

const JV_LETTER = {
  title: "约翰·维克多写给你的信",
  journalId: "whbHuntJVicLt001",
  handoutId: "whbHuntJVicLtH01",
  date: "——",
  to: "猎人",
  body: `我至今仍不知道你为何来到这里。你的理由可以永远保留。但我不能让你死在我找到你的地方，即使那样或许更仁慈。是我把你带到这里来的。

所以，我有一些亲身经历可以分享给大家。既然是我带你入会的，你就是我的血脉传承的一部分了。在这里，这已经算是最接近家人的关系了。我们需要你活下去。如果你能活下去，你就能和其他猎人一起建立自己的血脉。

生命短暂，有时唯有经历磨难才能真正学到东西。现在你眼界开阔，双手稳健。让我们看看在你积累起自己的经验之前，这些优势能带你走多远。在此之前，我希望我的建议能对你有所帮助。

——约翰·维克多`,
};

export async function buildJohnVictorLetterDocument() {
  return buildEphemeraLetterDocument({
    title: JV_LETTER.title,
    template: "classic-letter",
    fields: {
      date: JV_LETTER.date,
      to: JV_LETTER.to,
      body: JV_LETTER.body,
      signature: "",
      ps: "",
    },
    effects: { yellowing: 38, aging: 36, grain: 16, ink: 34, agingSeed: 447 },
  });
}

export async function buildJohnVictorLetterJournalDoc() {
  return buildJournalEntryFromDocument({
    journalId: JV_LETTER.journalId,
    handoutPageId: JV_LETTER.handoutId,
    title: JV_LETTER.title,
    img: "icons/sundries/documents/document-letter-open-tan.webp",
    source: SOURCE,
    document: await buildJohnVictorLetterDocument(),
  });
}

export async function createJohnVictorLetter({ open = true } = {}) {
  return createEphemeraBookInWorld({
    title: JV_LETTER.title,
    document: await buildJohnVictorLetterDocument(),
    source: SOURCE,
    open,
  });
}

/* -------------------------------------------------------------------------- */
/* 4) 约翰·维克多的手册                                                         */
/* -------------------------------------------------------------------------- */

const JV_HANDBOOK = [
  {
    title: "第一章",
    meta: "摘自约翰·维克多的手册　约 5×8 英寸",
    paragraphs: [
      "腐败：它就在这片沼泽地，就在科罗拉多的山区，我在其他地方也看到了迹象。但我生于斯长于斯，所以我可以告诉你我的亲身经历：有一天，我的家乡突然被尖叫声惊醒。人们生病了，像狗一样死在街头，他们的家人四处逃窜，然后又像蟑螂一样爬了起来。它毒害了牲畜，污染了水源。而且它还在蔓延。",
      "线索：它们会出现在目标出现的地方。循着线索，你就能找到怪物。与其费尽心思探究真相，不如称它们为线索。它们就像一扇扇小窗——通往地狱，或者完全是其他的地方。窗的另一边有什么东西在动。靠近时，我能感觉到，只是一阵颤栗。在特定的化合物中，这种感觉会更强烈。我们这些留下来的人，因为这里正在发生的变化，开始称它为「雕塑家」：像西瓜一样大的肿瘤，树上长出甲虫卵，还有长着熟悉面孔的怪物。有些人认为它是魔鬼，或者更糟。另一些人，比如哈罗德·布莱克，则认为如果我们研究得足够深入，就能像解释引力一样解释它。",
      "我觉得事情没那么简单明了。世上哪有那么简单。所以我看到线索就立刻封锁，然后尽量多放些怪物来维持局面。",
    ],
  },
  {
    title: "第二章",
    meta: "摘自约翰·维克多的手册　约 5×8 英寸",
    paragraphs: [
      "怪物：人死法五花八门，但怪物不一样。它们有强项也有弱点。我一拳打在一个身披盔甲的怪物身上，结果它反击时，我只摔断了肩膀。不过我身上带着刀，心想，刀刃刺穿了它。",
      "这些家伙里有些没有头，至少据我所见。如果它有头，就把它打死。",
      "在这里，子弹很珍贵。我得把它们留给目标和其他猎人。不过，我有很多子弹可以用来对付那些小怪物。",
      "应对竞争：有人也在追踪和我一样的目标。幸运的是，我听到了他们的脚步声，然后我放低身子，这样他们就听不到我的脚步声了。",
    ],
  },
  {
    title: "第三章",
    meta: "摘自约翰·维克多的手册　约 5×8 英寸",
    paragraphs: [
      "赏金：我不知道该如何解释最危险的怪物死后留下的东西。我们称它们为信物。它们会在你的牙齿后留下闪电，尝起来像金属和天空。你可以捡起它们，但之后，它们会留在你的眼后，让你看到如同篝火般橙色闪光的危险。",
      "报酬：在这些腐败区域之外，代币会卖给出价最高的人。新奥尔良郊外一个宁静的小镇里有一家酒吧。科罗拉多州森林深处有一家旅馆。大多数猎人为了给赞助者带来赏金并领取丰厚的奖励，会不惜一切代价，即使这意味着杀掉任何挡路的人。所以，不要在得不到怜悯的地方手下留情。",
      "黑暗的致敬：在这里，嘲笑迷信毫无意义，死者游荡，萤火虫在黑暗中发出蓝光。一位猎人曾教导我在营地里放一个杯子或碗之类的东西。人生就是投入，然后返回。",
      "日记：在北边的树上发现了一颗熊牙。我还以为狗够坏了呢。也许我可以给自己做一个幸运符。",
    ],
  },
  {
    title: "第四章",
    meta: "摘自约翰·维克多的手册　约 5×8 英寸",
    paragraphs: [
      "声望：这一切曾经更加正式。美国猎人协会兴起后又解散了。不过，我们当中许多人仍然恪守旧规。一个真正享有声望的猎人，会让所有敌人羡慕不已。",
      "装备：遇到困难时，我总会尝试一些新东西。但不要盲目地用新武器上战场。先在安静的地方测试一下。",
      "组队：在我给你的所有建议中，这是最重要的。有些猎人说不要相信任何人。但在这里，一个好朋友比任何赏金都更有价值，别让任何人动摇你的信念。当三个愤怒的陌生人来找我时，我当然希望有人在我身后支持我。有时候，挺身而出需要的勇气比其他所有勇气加起来都多，但永远值得。战场上见。",
    ],
  },
];

export async function buildJohnVictorHandbookDocument() {
  const pages = [
    bookPage(
      "扉页",
      `<p style="${HEAD}">约翰·维克多的手册</p><p style="${META}">约 5×8 英寸　猎人入门笔记</p><p style="${PARA}">与「约翰·维克多写给你的信」配套；信为引荐，手册为经验。</p>`
    ),
    ...JV_HANDBOOK.flatMap((r) => sectionPages({ ...r, maxChars: 320 })),
  ];
  const built = await finishBook({
    title: "约翰·维克多的手册",
    pages,
    coverColor: "#3a2c18",
    agingSeed: 58,
    journalId: "whbHuntJVicBk001",
    handoutId: "whbHuntJVicBkH01",
    img: "icons/sundries/books/book-worn-brown.webp",
  });
  return built.document;
}

export async function buildJohnVictorHandbookJournalDoc() {
  return buildJournalEntryFromDocument({
    journalId: "whbHuntJVicBk001",
    handoutPageId: "whbHuntJVicBkH01",
    title: "约翰·维克多的手册",
    img: "icons/sundries/books/book-worn-brown.webp",
    source: SOURCE,
    document: await buildJohnVictorHandbookDocument(),
  });
}

export async function createJohnVictorHandbook({ open = true } = {}) {
  return createEphemeraBookInWorld({
    title: "约翰·维克多的手册",
    document: await buildJohnVictorHandbookDocument(),
    source: SOURCE,
    open,
  });
}

/** 世界内一次性创建本组文献 */
export async function createAllWhitlawVictorLoreBooks({ open = false } = {}) {
  const created = [];
  created.push(await createScoutReportsBook({ open }));
  created.push(await createOtisLettersBook({ open }));
  created.push(await createJohnVictorLetter({ open }));
  created.push(await createJohnVictorHandbook({ open: true }));
  return created;
}
