/* 📖 英文說故事・大班上學期：The Magic Sweet Fart（每個小朋友都要學會念的故事）
 * 故事分成五段，一段一段練（老師上課、點點看、跟我說、口說練習、小遊戲考重要的字），最後「整篇故事」從頭念到尾。
 * story: true：故事書。每一段的故事句子放在 chant.lines（[英文, 中文意思]），words 是這一段的重要單字。
 * 自我介紹的名字是 Travis（爸爸說可以直接帶進去）。英文只能用 ASCII（' 和 " 不要用全形），錄音程式才認得是英文。
 */
(function () {
  const TITLE = 'The Magic Sweet Fart', TITLE_ZH = '神奇的香香屁';
  const part = (no, id, name, icon, color, dark, en, zh, words, lines) => ({
    id, no, name, icon, color, dark, unitWord: '段', noSentence: true,
    q: [en, zh], ans: '___.', ansZh: '___。', words, extra: [],
    chant: { title: TITLE, zh: TITLE_ZH, lines },
  });

  window.SHELF.addBook({
    id: 'en-k2-1-story', subject: 'english', type: 'english', story: true, grade: '大班', term: '上學期',
    title: '英文說故事', icon: '💨', color: '#b197fc', dark: '#7048e8', unitWord: '段',
    allName: '整篇故事', allNote: '從頭到尾念一遍',
    tiers: [{ name: '📖 The Magic Sweet Fart', note: '神奇的香香屁・分成五段練習', from: 1, to: 5 }],
    units: [
      part(1, 'hello', '自我介紹・兩兄弟', '👋', '#74c0fc', '#1971c2', 'Hello and two brothers', '自我介紹和兩兄弟', [
        { id: 'brothers', en: 'brothers', zh: '兄弟', pic: '👬' },
        { id: 'story', en: 'story', zh: '故事', pic: '📖' },
        { id: 'kind', en: 'kind', zh: '善良', pic: '💗' },
        { id: 'greedy', en: 'greedy', zh: '貪心', pic: '🤑' },
      ], [
        ['Hello, everyone!', '大家好！'],
        ['My name is Travis.', '我的名字是 Travis。'],
        ['Today, I want to tell you a funny story.', '今天，我要跟大家說一個好笑的故事。'],
        ['"The Magic Sweet Fart."', '《神奇的香香屁》。'],
        ['Once upon a time, there were two brothers.', '很久很久以前，有兩兄弟。'],
        ['The little brother was kind and nice.', '弟弟很善良、很親切。'],
        ['But the big brother was greedy.', '可是哥哥很貪心。'],
      ]),
      part(2, 'food', '神奇的食物', '🪄', '#ffa94d', '#d9480f', 'The magic food', '神奇的食物', [
        { id: 'hungry', en: 'hungry', zh: '肚子餓', pic: '🍽️' },
        { id: 'magic', en: 'magic food', zh: '神奇的食物', pic: '🪄' },
        { id: 'fart', en: 'fart', zh: '放屁', pic: '💨' },
        { id: 'sweet', en: 'sweet', zh: '香香甜甜的', pic: '🌸' },
      ], [
        ['One day, the little brother was very hungry.', '有一天，弟弟肚子很餓。'],
        ['He found some magic food. He ate it.', '他找到一些神奇的食物，就把它吃掉了。'],
        ['"Yummy, yummy!"', '「好吃，好吃！」'],
        ['Then suddenly... "Oh! Oh! I have to fart!"', '突然間……「喔！喔！我要放屁了！」'],
        ['He went... "Pooooof!"', '他就……「噗～！」'],
        ['Guess what? His fart was not stinky!', '你猜怎麼了？他的屁一點都不臭！'],
        ['It smelled sweet!', '聞起來香香甜甜的！'],
      ]),
      part(3, 'money', '大家來聞香香屁', '💰', '#69db7c', '#2b8a3e', 'Many people came', '很多人都跑來了', [
        { id: 'surprised', en: 'surprised', zh: '嚇一跳', pic: '😲' },
        { id: 'man', en: 'man', zh: '一個男人', pic: '👨' },
        { id: 'money', en: 'money', zh: '錢', pic: '💰' },
        { id: 'happy', en: 'happy', zh: '開心', pic: '😄' },
      ], [
        ['The little brother was surprised.', '弟弟嚇了一跳。'],
        ['"Wow! My fart smells good!"', '「哇！我的屁好香！」'],
        ['Then a man came by. He smelled the air.', '這時候有一個人經過，他聞了聞空氣。'],
        ['"Mmm... What smells so good?"', '「嗯……什麼東西這麼香？」'],
        ['The little brother said, "It\'s my fart!"', '弟弟說：「是我的屁！」'],
        ['The man was surprised. "Your fart?!"', '那個人很驚訝：「你的屁？！」'],
        ['"Yes!" "Pooooof!"', '「對！」「噗～！」'],
        ['The man laughed and said, "Wow! That smells wonderful!"', '那個人笑著說：「哇！好香喔！」'],
        ['He gave the little brother some money.', '他給了弟弟一些錢。'],
        ['The little brother was very happy.', '弟弟好開心。'],
        ['Soon, many people came to smell his sweet fart.', '很快地，很多人都跑來聞他的香香屁。'],
        ['"Pooooof!" "Wow!" "Pooooof!" "So sweet!"', '「噗～！」「哇！」「噗～！」「好香喔！」'],
        ['The little brother made lots of money.', '弟弟賺了好多錢。'],
      ]),
      part(4, 'stinky', '哥哥的臭屁', '🤢', '#a9e34b', '#5c940d', 'The big brother', '哥哥', [
        { id: 'jealous', en: 'jealous', zh: '嫉妒', pic: '😒' },
        { id: 'wait', en: 'waited', zh: '等啊等', pic: '⏳' },
        { id: 'stinky', en: 'stinky', zh: '臭臭的', pic: '🦨' },
        { id: 'nose', en: 'nose', zh: '鼻子', pic: '👃' },
        { id: 'embarrassed', en: 'embarrassed', zh: '好丟臉', pic: '😳' },
      ], [
        ['But his big brother was jealous.', '可是哥哥很嫉妒。'],
        ['He said, "Why can he make money?"', '他說：「為什麼他可以賺錢？」'],
        ['"I want to make money, too!"', '「我也要賺錢！」'],
        ['So, he ate the magic food.', '所以，他也吃了神奇的食物。'],
        ['He waited... And waited... Then... "Pooooof!"', '他等啊……等啊……然後……「噗～！」'],
        ['Oh, no! It was very, very stinky!', '糟糕！好臭好臭！'],
        ['"Yuck! Yuck! Yuck!"', '「噁！噁！噁！」'],
        ['The big brother covered his nose.', '哥哥捂住了鼻子。'],
        ['He was so embarrassed.', '他好丟臉喔。'],
      ]),
      part(5, 'friends', '不要貪心', '🤝', '#f783ac', '#c2255c', 'Don\'t be greedy', '不要貪心', [
        { id: 'sorry', en: 'sorry', zh: '對不起', pic: '🙏' },
        { id: 'friends', en: 'good friends', zh: '好朋友', pic: '🤝' },
        { id: 'share', en: 'share', zh: '分享', pic: '🍪' },
        { id: 'thanks', en: 'thank you', zh: '謝謝', pic: '💐' },
      ], [
        ['The little brother said, "Brother, don\'t be greedy."', '弟弟說：「哥哥，不要貪心。」'],
        ['The big brother said, "I\'m sorry."', '哥哥說：「對不起。」'],
        ['"I won\'t be greedy anymore."', '「我再也不貪心了。」'],
        ['The two brothers smiled and became good friends.', '兩兄弟笑了，變成好朋友。'],
        ['And they lived happily ever after.', '從此以後，他們快快樂樂地生活在一起。'],
        ['So, boys and girls,', '所以，各位小朋友，'],
        ['Don\'t be greedy.', '不要貪心。'],
        ['Be kind and share!', '要善良，要分享！'],
        ['Thank you!', '謝謝大家！'],
      ]),
    ],
  });
})();
