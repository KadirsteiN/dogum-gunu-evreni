import {
  ActivityLogData,
  WheelItemData,
  QuizQuestionData,
  CouponData,
  SpecialNoteData,
  MemoryData,
  SiteConfigData,
} from "@/types";

export interface UniverseDatabase {
  siteConfig: SiteConfigData;
  wheelItems: WheelItemData[];
  quizQuestions: QuizQuestionData[];
  coupons: CouponData[];
  notes: SpecialNoteData[];
  memories: MemoryData[];
  activityLogs: ActivityLogData[];
}

export function createInitialSeedData(): UniverseDatabase {
  const now = new Date().toISOString();

  return {
    siteConfig: {
      id: "default",
      partnerName: "Güzel Sevgilim",
      heroTitle: "İyi ki Doğdun, İyi ki Benimlesin! 🎂✨",
      heroSubtitle:
        "Seninle geçen her saniye hayatımın en güzel hediyesi. Bu küçük evreni sadece senin yüzünde tatlı bir tebessüm görmek için hazırladım...",
      relationshipDate: "2023-06-15T14:30:00.000Z",
      playlist: [
        {
          title: "Romantik Melodiler (Akustik)",
          artist: "Bizim Şarkımız",
          url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
          note: "Gözlerinin içine her baktığımda kalbimde çalan o tatlı ritim... 💕",
        },
        {
          title: "Yıldızların Altında",
          artist: "Gece Esintisi",
          url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_946b0939c8.mp3",
          note: "Seninle sabaha kadar konuştuğumuz o unutulmaz gecelerin fon müziği 🌙",
        },
        {
          title: "Tatlı Sabahlar",
          artist: "Piyano & Kahve",
          url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3",
          note: "Birlikte uyanacağımız tüm güzel sabahlara gelsin ☕🌸",
        },
      ],
    },
    wheelItems: [
      { id: "w1", label: "Bol Soslu İskender 🥙", color: "#FF6B8B", category: "FOOD", isActive: true },
      { id: "w2", label: "Çıtır İtalyan Pizzası 🍕", color: "#FF8FA3", category: "FOOD", isActive: true },
      { id: "w3", label: "Sushi & Noodle Gecesi 🍣", color: "#FFA6C1", category: "FOOD", isActive: true },
      { id: "w4", label: "Ev Yapımı Burger Ziyafeti 🍔", color: "#F472B6", category: "FOOD", isActive: true },
      { id: "w5", label: "Kremalı Mantarlı Makarna 🍝", color: "#FB7185", category: "FOOD", isActive: true },
      { id: "w6", label: "Acılı Adana & Künefe 🌶️", color: "#E11D48", category: "FOOD", isActive: true },
      { id: "w7", label: "Taco & Nachos Partisi 🌮", color: "#EC4899", category: "FOOD", isActive: true },
      { id: "w8", label: "Tatlı Krizi: Waffle & Kahve 🧇", color: "#BE185D", category: "FOOD", isActive: true },
    ],
    quizQuestions: [
      {
        id: "q1",
        question: "İlk buluşmamızda ikimizin de gizlice heyecanlandığı o an hangisiydi?",
        options: [
          "Kahveleri dökecek gibi olmamız ☕",
          "Göz göze gelip aynı anda gülmemiz 😊",
          "Menüye bakıp 20 dakika karar veremememiz 📖",
          "Yanlış masaya oturmamız 🪑",
        ],
        correctIndex: 1,
        rewardMessage: "Harikasın! O bakışmayı ve gülüşünü asla unutamam 🥰",
        order: 1,
      },
      {
        id: "q2",
        question: "Benim sende en çok sevdiğim ve her gördüğümde eridiğim detay nedir?",
        options: [
          "Saçlarını düzeltişin ✨",
          "Heyecanlanınca hızlı hızlı konuşman 💬",
          "İçten ve gözlerinin içi gülerek gülümsemen 💖",
          "Trip atarken bile tatlı olman 🙈",
        ],
        correctIndex: 2,
        rewardMessage: "Tam isabet! Sen güldüğünde dünyam aydınlanıyor 🌸",
        order: 2,
      },
      {
        id: "q3",
        question: "Birlikte yapmaktan en çok keyif aldığımız aktivite hangisi?",
        options: [
          "Saatlerce ne izleyeceğimizi seçip ilk 15 dakikada uyumak 🎬",
          "Gece yarısı tatlı/yemek söyleyip dedikodu yapmak 🍕",
          "Plansızca yürüyüşe çıkıp kaybolmak 🌆",
          "Hepsi! Seninle her şey dünyanın en güzel aktivitesi 💞",
        ],
        correctIndex: 3,
        rewardMessage: "Tabii ki hepsi! Seninle sıkılmak kelimesi sözlüğümde yok 👑",
        order: 3,
      },
      {
        id: "q4",
        question: "Sen acıktığında veya yorulduğunda seni mutlu etmenin en garantili yolu nedir?",
        options: [
          "Hiç soru sormadan en sevdiğin yemeği ve tatlıyı getirmek 🍔🍰",
          "Sıkıca sarılıp saçlarınla oynamak 🤗",
          "Haklısın aşkım diyerek onaylamak ✅",
          "Yukarıdakilerin üçünü aynı anda uygulamak 🚀",
        ],
        correctIndex: 3,
        rewardMessage: "Kullanma kılavuzunu ezbere biliyorum gördüğün gibi! 😎💗",
        order: 4,
      },
      {
        id: "q5",
        question: "Gelecekte birlikte gerçekleştirmek istediğimiz en tatlı hayalimiz?",
        options: [
          "Bütün dünyayı el ele gezmek ✈️",
          "Sabahları kahve kokusuyla kendi evimizde uyanmak 🏡",
          "Birlikte yaşlanıp bu günleri gülerek anlatmak 👵👴",
          "Bu şıkların tamamını tek tek yaşamak ✨",
        ],
        correctIndex: 3,
        rewardMessage: "Hepsini birlikte, el ele gerçekleştireceğiz sevgilim! 💍❤️",
        order: 5,
      },
    ],
    coupons: [
      {
        id: "c1",
        title: "Koşulsuz Şartsız Haklılık Kuponu",
        description: "Herhangi bir tartışmada bu kuponu kullandığın an konu kapanır ve %100 haklı ilan edilirsin.",
        emoji: "👑",
        isUsed: false,
        usedAt: null,
      },
      {
        id: "c2",
        title: "30 Dakika VIP Masaj & Saç Oynama",
        description: "Yorgun bir günün sonunda hiç itirazsız yarım saat boyunca omuz masajı veya saç okşama hizmeti.",
        emoji: "💆‍♀️",
        isUsed: false,
        usedAt: null,
      },
      {
        id: "c3",
        title: "Film & Dizi Seçim Veto Hakkı",
        description: "Bu gece ne izleyeceğimize sadece ve sadece sen karar veriyorsun, mızmızlanmak yasak!",
        emoji: "🎬",
        isUsed: false,
        usedAt: null,
      },
      {
        id: "c4",
        title: "Gece Yarısı Tatlı / Yemek Operasyonu",
        description: "Saat kaç olursa olsun canının çektiği o tatlı veya yemek kapında!",
        emoji: "🍫",
        isUsed: false,
        usedAt: null,
      },
      {
        id: "c5",
        title: "1 Adet Trip Affetme & Barışma Kartı",
        description: "Atılan en büyük tribi bile anında sarılarak ve öperek tatlıya bağlama bileti.",
        emoji: "🕊️",
        isUsed: false,
        usedAt: null,
      },
      {
        id: "c6",
        title: "Sürpriz Romantik Randevu Günü",
        description: "Tüm planlaması bana ait olan, sadece hazırlanıp geleceğin özel bir gün.",
        emoji: "🌹",
        isUsed: false,
        usedAt: null,
      },
    ],
    notes: [
      {
        id: "n1",
        type: "JAR",
        title: "Gülüşün...",
        content: "Çünkü en kötü günümde bile tek bir gülüşünle içimdeki tüm bulutları dağıtabiliyorsun.",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n2",
        type: "JAR",
        title: "Merhametin",
        content: "Çünkü kalbin o kadar temiz ve sevgi dolu ki, yanında kendimi dünyanın en şanslı insanı hissediyorum.",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n3",
        type: "JAR",
        title: "Gözlerin",
        content: "Çünkü gözlerinin içine baktığımda evimdeymişim gibi derin bir huzur buluyorum.",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n4",
        type: "JAR",
        title: "Doğallığın",
        content: "Çünkü senin yanında hiçbir maskeye ihtiyaç duymadan, tamamen kendim olabiliyorum.",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n5",
        type: "JAR",
        title: "Ses Tonun",
        content: "Çünkü 'Nasılsın?' deyişin bile günün bütün yorgunluğunu üzerimden almaya yetiyor.",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n6",
        type: "JAR",
        title: "Heyecanın",
        content: "Çünkü küçük şeylerden bile çocuklar gibi mutlu olman ve o enerjin bana hayat sevinci veriyor.",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n7",
        type: "JAR",
        title: "Sarılışın",
        content: "Çünkü bana sarıldığında zaman duruyor ve dünyadaki tüm dertler kapının dışında kalıyor.",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n8",
        type: "JAR",
        title: "Zekan ve Mizahın",
        content: "Çünkü kimsenin anlamadığı esprilere sadece ikimizin bakışarak kahkaha atmasını çok seviyorum.",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n9",
        type: "JAR",
        title: "Desteğin",
        content: "Çünkü düştüğümde elimden tutan, başarımda benden çok sevinen en yakın arkadaşımsın.",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n10",
        type: "JAR",
        title: "Sadece Sen Olduğun İçin",
        content: "Çünkü bin kere dünyaya gelsem, bininde de yine seni arar, yine sana aşık olurdum.",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n11",
        type: "COOKIE",
        title: null,
        content: "Bugün seni çok ama çok seven birinden kocaman bir öpücük ve sürpriz bir sarılma kazanacaksın! 🥠💋",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n12",
        type: "COOKIE",
        title: null,
        content: "Falında yakın zamanda sevgilinle birlikte yiyeceğin bol kalorili ve aşırı lezzetli bir yemek görünüyor! 🍕✨",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n13",
        type: "COOKIE",
        title: null,
        content: "Yıldızlar diyor ki: Şu an bu ekranın arkasında seni düşündükçe gülümseyen biri var. 🌟🥰",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n14",
        type: "COOKIE",
        title: null,
        content: "Bu kurabiyeyi kırdığın an dileyeceğin ilk dilek sevgilin tarafından en kısa sürede gerçekleştirilecek! 🪄💝",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n15",
        type: "COOKIE",
        title: null,
        content: "Bugün şansın %100! Yapacağın her naz ve atacağın her tatlı trip anında ilgiyle ödüllendirilecek. 🎀👑",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n16",
        type: "COOKIE",
        title: null,
        content: "Yeni yaşın sana sağlık, huzur, kahkaha ve benimle geçecek binlerce unutulmaz anı getiriyor! 🎂🎉",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n17",
        type: "CAPSULE",
        title: "Doğum Günün İçin Özel Mektubum 💌",
        content:
          "Sevgilim, iyi ki doğdun! Hayatımın en güzel tesadüfü, en doğru kararı sensin. Yeni yaşında da elini hiç bırakmadan, her anımıza yeni kahkahalar ekleyerek yürümek tek dileğim. Seni kelimelerin anlatabileceğinden çok daha fazla seviyorum!",
        unlockDate: "2024-01-01T00:00:00.000Z",
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n18",
        type: "CAPSULE",
        title: "Canın Sıkkın Olduğunda Açacağın Zarf 🫂",
        content:
          "Eğer bu zarfı açtıysan belki biraz yorgunsun ya da moralin bozuk... Lütfen derin bir nefes al ve şunu unutma: Sen tanıdığım en güçlü, en değerli ve en güzel kalpli insansın. Her ne olduysa birlikte aşarız. Şimdi bana bir mesaj at, hemen yanındayım.",
        unlockDate: null,
        isOpened: false,
        createdAt: now,
      },
      {
        id: "n19",
        type: "CAPSULE",
        title: "Gelecek Yılki Yıldönümümüz İçin Kapsül ⏳",
        content:
          "Bu mektup gelecekteki bize! Kim bilir bu tarihe kadar daha kaç güzel anı biriktirdik, kaç kez güldük, kaç yeni yer keşfettik... İlk günkü heyecanımla seni sevmeye devam ediyorum.",
        unlockDate: "2027-06-15T00:00:00.000Z",
        isOpened: false,
        createdAt: now,
      },
    ],
    memories: [
      {
        id: "m1",
        title: "Kalplerimizin İlk Kez Aynı Ritimde Attığı Gün ✨",
        story:
          "Zamanın nasıl geçtiğini hiç anlamadığımız, kahvelerimiz soğusa bile sohbetimizin hiç bitmediği o ilk gün... Eve dönerken yüzümdeki gülümsemeyi silememiştim.",
        mediaUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80",
        mediaType: "IMAGE",
        location: "En Sevdiğimiz Kahveci ☕",
        date: "2023-06-15T15:00:00.000Z",
      },
      {
        id: "m2",
        title: "Gün Batımını Birlikte İzlediğimiz O Akşam 🌅",
        story:
          "Gökyüzünün pembe ve turuncuya boyandığı, rüzgarın saçlarını uçurduğu o akşamüstü. Yanımda sen varken manzaranın ne kadar sönük kaldığını düşünmüştüm.",
        mediaUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=80",
        mediaType: "IMAGE",
        location: "Sahil Yürüyüşü 🌊",
        date: "2023-09-22T18:30:00.000Z",
      },
      {
        id: "m3",
        title: "Kahkahalarla Dolu Unutulmaz Kaçamağımız 🎈",
        story:
          "Planladığımız hiçbir şeyin plana uymadığı ama hayatımızda en çok eğlendiğimiz o harika hafta sonu. Seninle kaybolmak bile ayrı bir macera!",
        mediaUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
        mediaType: "IMAGE",
        location: "Bizim Köşemiz 🌸",
        date: "2024-04-14T13:00:00.000Z",
      },
    ],
    activityLogs: [],
  };
}

const globalForStore = globalThis as unknown as {
  universeStore: UniverseDatabase | undefined;
};

export function getStore(): UniverseDatabase {
  if (!globalForStore.universeStore) {
    globalForStore.universeStore = createInitialSeedData();
  }
  return globalForStore.universeStore;
}

export function resetStore(resetAllContent = false): UniverseDatabase {
  const current = getStore();
  if (resetAllContent) {
    globalForStore.universeStore = createInitialSeedData();
  } else {
    current.activityLogs = [];
    current.coupons = current.coupons.map((c) => ({
      ...c,
      isUsed: false,
      usedAt: null,
    }));
    current.notes = current.notes.map((n) => ({
      ...n,
      isOpened: false,
    }));
  }
  return getStore();
}

export function replaceStore(newStore: Partial<UniverseDatabase>): UniverseDatabase {
  const current = getStore();
  globalForStore.universeStore = {
    siteConfig: newStore.siteConfig || current.siteConfig,
    wheelItems: Array.isArray(newStore.wheelItems) ? newStore.wheelItems : current.wheelItems,
    quizQuestions: Array.isArray(newStore.quizQuestions)
      ? newStore.quizQuestions
      : current.quizQuestions,
    coupons: Array.isArray(newStore.coupons) ? newStore.coupons : current.coupons,
    notes: Array.isArray(newStore.notes) ? newStore.notes : current.notes,
    memories: Array.isArray(newStore.memories) ? newStore.memories : current.memories,
    activityLogs: Array.isArray(newStore.activityLogs)
      ? newStore.activityLogs
      : current.activityLogs,
  };
  return globalForStore.universeStore;
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
