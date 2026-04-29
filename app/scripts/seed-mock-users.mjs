import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const USER_COUNT_PER_GROUP = 100;
const TOTAL_USER_COUNT = USER_COUNT_PER_GROUP * 3;
const CN_EMAIL_DOMAINS = ["qq.com", "163.com", "gmail.com", "outlook.com"];
const JP_EMAIL_DOMAINS = ["gmail.com", "yahoo.co.jp", "outlook.jp"];
const EN_EMAIL_DOMAINS = ["gmail.com", "outlook.com", "proton.me"];

const SURNAME_POOL = [
  { hanzi: "王", pinyin: "wang" },
  { hanzi: "李", pinyin: "li" },
  { hanzi: "张", pinyin: "zhang" },
  { hanzi: "刘", pinyin: "liu" },
  { hanzi: "陈", pinyin: "chen" },
  { hanzi: "杨", pinyin: "yang" },
  { hanzi: "赵", pinyin: "zhao" },
  { hanzi: "黄", pinyin: "huang" },
  { hanzi: "周", pinyin: "zhou" },
  { hanzi: "吴", pinyin: "wu" },
  { hanzi: "徐", pinyin: "xu" },
  { hanzi: "孙", pinyin: "sun" },
  { hanzi: "马", pinyin: "ma" },
  { hanzi: "朱", pinyin: "zhu" },
  { hanzi: "胡", pinyin: "hu" },
  { hanzi: "郭", pinyin: "guo" },
  { hanzi: "何", pinyin: "he" },
  { hanzi: "高", pinyin: "gao" },
  { hanzi: "林", pinyin: "lin" },
  { hanzi: "郑", pinyin: "zheng" },
];

const GIVEN_NAME_POOL = [
  { hanzi: "子涵", pinyin: "zihan" },
  { hanzi: "雨桐", pinyin: "yutong" },
  { hanzi: "梓轩", pinyin: "zixuan" },
  { hanzi: "浩然", pinyin: "haoran" },
  { hanzi: "若曦", pinyin: "ruoxi" },
  { hanzi: "一诺", pinyin: "yinuo" },
  { hanzi: "思远", pinyin: "siyuan" },
  { hanzi: "诗涵", pinyin: "shihan" },
  { hanzi: "嘉怡", pinyin: "jiayi" },
  { hanzi: "宇辰", pinyin: "yuchen" },
  { hanzi: "可欣", pinyin: "kexin" },
  { hanzi: "晨曦", pinyin: "chenxi" },
  { hanzi: "依诺", pinyin: "yinuo" },
  { hanzi: "俊杰", pinyin: "junjie" },
  { hanzi: "欣妍", pinyin: "xinyan" },
  { hanzi: "睿哲", pinyin: "ruizhe" },
  { hanzi: "梦瑶", pinyin: "mengyao" },
  { hanzi: "博文", pinyin: "bowen" },
  { hanzi: "芷晴", pinyin: "zhiqing" },
  { hanzi: "天宇", pinyin: "tianyu" },
  { hanzi: "语彤", pinyin: "yutong" },
  { hanzi: "志远", pinyin: "zhiyuan" },
  { hanzi: "佳宁", pinyin: "jianing" },
  { hanzi: "昊天", pinyin: "haotian" },
  { hanzi: "亦菲", pinyin: "yifei" },
  { hanzi: "泽宇", pinyin: "zeyu" },
  { hanzi: "舒雅", pinyin: "shuya" },
  { hanzi: "景行", pinyin: "jingxing" },
  { hanzi: "安琪", pinyin: "anqi" },
  { hanzi: "明轩", pinyin: "mingxuan" },
  { hanzi: "沐晴", pinyin: "muqing" },
  { hanzi: "子墨", pinyin: "zimo" },
  { hanzi: "清妍", pinyin: "qingyan" },
  { hanzi: "承泽", pinyin: "chengze" },
  { hanzi: "星妍", pinyin: "xingyan" },
  { hanzi: "奕辰", pinyin: "yichen" },
  { hanzi: "乐瑶", pinyin: "leyao" },
  { hanzi: "皓轩", pinyin: "haoxuan" },
  { hanzi: "雨菲", pinyin: "yufei" },
  { hanzi: "书恒", pinyin: "shuheng" },
];

const JP_FAMILY_NAMES = [
  { name: "佐藤", romaji: "sato" },
  { name: "铃木", romaji: "suzuki" },
  { name: "高桥", romaji: "takahashi" },
  { name: "田中", romaji: "tanaka" },
  { name: "渡边", romaji: "watanabe" },
  { name: "伊藤", romaji: "ito" },
  { name: "山本", romaji: "yamamoto" },
  { name: "中村", romaji: "nakamura" },
  { name: "小林", romaji: "kobayashi" },
  { name: "加藤", romaji: "kato" },
];

const JP_GIVEN_NAMES = [
  { name: "阳斗", romaji: "haruto" },
  { name: "莲", romaji: "ren" },
  { name: "凑", romaji: "minato" },
  { name: "结爱", romaji: "yua" },
  { name: "阳菜", romaji: "hina" },
  { name: "葵", romaji: "aoi" },
  { name: "美咲", romaji: "misaki" },
  { name: "拓海", romaji: "takumi" },
  { name: "优奈", romaji: "yuna" },
  { name: "真央", romaji: "mao" },
];

const EN_FIRST_NAMES = [
  "Olivia",
  "Emma",
  "Ava",
  "Sophia",
  "Isabella",
  "Liam",
  "Noah",
  "Oliver",
  "Elijah",
  "James",
];

const EN_LAST_NAMES = [
  "Smith",
  "Johnson",
  "Brown",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
];

function buildChineseUser(globalIndex, localIndex) {
  const n = String(globalIndex + 1).padStart(3, "0");
  const surname = SURNAME_POOL[localIndex % SURNAME_POOL.length];
  const givenName = GIVEN_NAME_POOL[
    (localIndex * 7 + Math.floor(localIndex / SURNAME_POOL.length)) % GIVEN_NAME_POOL.length
  ];
  const domain = CN_EMAIL_DOMAINS[localIndex % CN_EMAIL_DOMAINS.length];
  return {
    id: `mock-user-${n}`,
    name: `${surname.hanzi}${givenName.hanzi}`,
    email: `${surname.pinyin}.${givenName.pinyin}.${n}@${domain}`,
    emailVerified: globalIndex % 2 === 0,
  };
}

function buildJapaneseUser(globalIndex, localIndex) {
  const n = String(globalIndex + 1).padStart(3, "0");
  const familyName = JP_FAMILY_NAMES[localIndex % JP_FAMILY_NAMES.length];
  const givenName = JP_GIVEN_NAMES[
    (localIndex * 5 + Math.floor(localIndex / JP_FAMILY_NAMES.length)) % JP_GIVEN_NAMES.length
  ];
  const domain = JP_EMAIL_DOMAINS[localIndex % JP_EMAIL_DOMAINS.length];
  return {
    id: `mock-user-${n}`,
    name: `${familyName.name}${givenName.name}`,
    email: `${familyName.romaji}.${givenName.romaji}.${n}@${domain}`,
    emailVerified: globalIndex % 2 === 0,
  };
}

function buildEnglishUser(globalIndex, localIndex) {
  const n = String(globalIndex + 1).padStart(3, "0");
  const firstName = EN_FIRST_NAMES[localIndex % EN_FIRST_NAMES.length];
  const lastName = EN_LAST_NAMES[
    (localIndex * 3 + Math.floor(localIndex / EN_FIRST_NAMES.length)) % EN_LAST_NAMES.length
  ];
  const domain = EN_EMAIL_DOMAINS[localIndex % EN_EMAIL_DOMAINS.length];
  return {
    id: `mock-user-${n}`,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${n}@${domain}`,
    emailVerified: globalIndex % 2 === 0,
  };
}

function buildUser(index) {
  if (index < USER_COUNT_PER_GROUP) {
    return buildChineseUser(index, index);
  }
  if (index < USER_COUNT_PER_GROUP * 2) {
    return buildJapaneseUser(index, index - USER_COUNT_PER_GROUP);
  }
  return buildEnglishUser(index, index - USER_COUNT_PER_GROUP * 2);
}

async function main() {
  const users = Array.from({ length: TOTAL_USER_COUNT }, (_, i) => buildUser(i));
  const result = await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });
  console.log(
    `Users done. requested=${TOTAL_USER_COUNT} (cn=${USER_COUNT_PER_GROUP}, jp=${USER_COUNT_PER_GROUP}, en=${USER_COUNT_PER_GROUP}), inserted=${result.count}`,
  );
}

main()
  .catch((error) => {
    console.error("seed users failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
