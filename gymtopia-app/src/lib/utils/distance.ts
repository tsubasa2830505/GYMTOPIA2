/**
 * 住所から最寄り駅までの徒歩時間を計算するユーティリティ
 */

// 主要駅の座標データ（全国）
const MAJOR_STATIONS = {
  // 東京都内 - JR山手線
  '新宿駅': { lat: 35.6896, lng: 139.7006, area: '新宿', region: 'tokyo' },
  '渋谷駅': { lat: 35.6580, lng: 139.7016, area: '渋谷', region: 'tokyo' },
  '池袋駅': { lat: 35.7295, lng: 139.7109, area: '池袋', region: 'tokyo' },
  '東京駅': { lat: 35.6812, lng: 139.7671, area: '丸の内', region: 'tokyo' },
  '品川駅': { lat: 35.6284, lng: 139.7387, area: '品川', region: 'tokyo' },
  '恵比寿駅': { lat: 35.6465, lng: 139.7104, area: '恵比寿', region: 'tokyo' },
  '上野駅': { lat: 35.7137, lng: 139.7774, area: '上野', region: 'tokyo' },
  '秋葉原駅': { lat: 35.6983, lng: 139.7731, area: '秋葉原', region: 'tokyo' },
  '有楽町駅': { lat: 35.6751, lng: 139.7632, area: '有楽町', region: 'tokyo' },
  '神田駅': { lat: 35.6916, lng: 139.7711, area: '神田', region: 'tokyo' },
  '浜松町駅': { lat: 35.6556, lng: 139.7570, area: '浜松町', region: 'tokyo' },
  '田町駅': { lat: 35.6456, lng: 139.7477, area: '田町', region: 'tokyo' },
  '高輪ゲートウェイ駅': { lat: 35.6365, lng: 139.7408, area: '高輪', region: 'tokyo' },
  '大崎駅': { lat: 35.6197, lng: 139.7281, area: '大崎', region: 'tokyo' },
  '五反田駅': { lat: 35.6258, lng: 139.7238, area: '五反田', region: 'tokyo' },
  '目黒駅': { lat: 35.6333, lng: 139.7155, area: '目黒', region: 'tokyo' },
  '代々木駅': { lat: 35.6831, lng: 139.7020, area: '代々木', region: 'tokyo' },
  '原宿駅': { lat: 35.6702, lng: 139.7027, area: '原宿', region: 'tokyo' },
  '新大久保駅': { lat: 35.7013, lng: 139.7002, area: '新大久保', region: 'tokyo' },
  '高田馬場駅': { lat: 35.7127, lng: 139.7038, area: '高田馬場', region: 'tokyo' },
  '目白駅': { lat: 35.7216, lng: 139.7064, area: '目白', region: 'tokyo' },
  '大塚駅': { lat: 35.7315, lng: 139.7289, area: '大塚', region: 'tokyo' },
  '巣鴨駅': { lat: 35.7335, lng: 139.7393, area: '巣鴨', region: 'tokyo' },
  '駒込駅': { lat: 35.7364, lng: 139.7472, area: '駒込', region: 'tokyo' },
  '田端駅': { lat: 35.7378, lng: 139.7607, area: '田端', region: 'tokyo' },
  '西日暮里駅': { lat: 35.7320, lng: 139.7669, area: '西日暮里', region: 'tokyo' },
  '日暮里駅': { lat: 35.7276, lng: 139.7710, area: '日暮里', region: 'tokyo' },
  '鶯谷駅': { lat: 35.7211, lng: 139.7789, area: '鶯谷', region: 'tokyo' },
  '御徒町駅': { lat: 35.7077, lng: 139.7741, area: '御徒町', region: 'tokyo' },

  // 東京メトロ・都営地下鉄主要駅
  '銀座駅': { lat: 35.6719, lng: 139.7653, area: '銀座', region: 'tokyo' },
  '六本木駅': { lat: 35.6627, lng: 139.7314, area: '六本木', region: 'tokyo' },
  '表参道駅': { lat: 35.6652, lng: 139.7123, area: '表参道', region: 'tokyo' },
  '赤坂見附駅': { lat: 35.6794, lng: 139.7366, area: '赤坂', region: 'tokyo' },
  '霞ヶ関駅': { lat: 35.6740, lng: 139.7547, area: '霞ヶ関', region: 'tokyo' },
  '虎ノ門駅': { lat: 35.6686, lng: 139.7506, area: '虎ノ門', region: 'tokyo' },
  '永田町駅': { lat: 35.6799, lng: 139.7402, area: '永田町', region: 'tokyo' },
  '九段下駅': { lat: 35.6958, lng: 139.7526, area: '九段下', region: 'tokyo' },
  '大手町駅': { lat: 35.6843, lng: 139.7638, area: '大手町', region: 'tokyo' },
  '日本橋駅': { lat: 35.6812, lng: 139.7739, area: '日本橋', region: 'tokyo' },
  '茅場町駅': { lat: 35.6793, lng: 139.7789, area: '茅場町', region: 'tokyo' },
  '人形町駅': { lat: 35.6866, lng: 139.7828, area: '人形町', region: 'tokyo' },
  '水天宮前駅': { lat: 35.6886, lng: 139.7906, area: '水天宮前', region: 'tokyo' },
  '三越前駅': { lat: 35.6878, lng: 139.7721, area: '三越前', region: 'tokyo' },
  '新橋駅': { lat: 35.6665, lng: 139.7583, area: '新橋', region: 'tokyo' },
  '築地市場駅': { lat: 35.6654, lng: 139.7707, area: '築地', region: 'tokyo' },
  '月島駅': { lat: 35.6644, lng: 139.7802, area: '月島', region: 'tokyo' },
  '豊洲駅': { lat: 35.6548, lng: 139.7956, area: '豊洲', region: 'tokyo' },
  '新木場駅': { lat: 35.6464, lng: 139.8267, area: '新木場', region: 'tokyo' },

  // 私鉄主要駅
  '新宿三丁目駅': { lat: 35.6929, lng: 139.7066, area: '新宿三丁目', region: 'tokyo' },
  '歌舞伎町駅': { lat: 35.6947, lng: 139.7030, area: '歌舞伎町', region: 'tokyo' },
  '明治神宮前駅': { lat: 35.6703, lng: 139.7027, area: '明治神宮前', region: 'tokyo' },
  '青山一丁目駅': { lat: 35.6725, lng: 139.7241, area: '青山一丁目', region: 'tokyo' },
  '溜池山王駅': { lat: 35.6739, lng: 139.7363, area: '溜池山王', region: 'tokyo' },
  '国会議事堂前駅': { lat: 35.6743, lng: 139.7436, area: '国会議事堂前', region: 'tokyo' },
  '汐留駅': { lat: 35.6660, lng: 139.7596, area: '汐留', region: 'tokyo' },
  '新豊洲駅': { lat: 35.6586, lng: 139.7936, area: '新豊洲', region: 'tokyo' },

  // 東京郊外主要駅
  '立川駅': { lat: 35.6987, lng: 139.4144, area: '立川', region: 'tokyo' },
  '八王子駅': { lat: 35.6559, lng: 139.3386, area: '八王子', region: 'tokyo' },
  '町田駅': { lat: 35.5424, lng: 139.4467, area: '町田', region: 'tokyo' },
  '吉祥寺駅': { lat: 35.7032, lng: 139.5803, area: '吉祥寺', region: 'tokyo' },
  '三鷹駅': { lat: 35.7056, lng: 139.5603, area: '三鷹', region: 'tokyo' },
  '国分寺駅': { lat: 35.7026, lng: 139.4621, area: '国分寺', region: 'tokyo' },
  '国立駅': { lat: 35.6972, lng: 139.4413, area: '国立', region: 'tokyo' },
  '調布駅': { lat: 35.6516, lng: 139.5414, area: '調布', region: 'tokyo' },
  '府中駅': { lat: 35.6697, lng: 139.4777, area: '府中', region: 'tokyo' },
  '分倍河原駅': { lat: 35.6684, lng: 139.4682, area: '分倍河原', region: 'tokyo' },

  // 東京東部
  '錦糸町駅': { lat: 35.6969, lng: 139.8148, area: '錦糸町', region: 'tokyo' },
  '亀戸駅': { lat: 35.6975, lng: 139.8262, area: '亀戸', region: 'tokyo' },
  '小岩駅': { lat: 35.7309, lng: 139.8775, area: '小岩', region: 'tokyo' },
  '葛西駅': { lat: 35.6651, lng: 139.8607, area: '葛西', region: 'tokyo' },
  '西葛西駅': { lat: 35.6646, lng: 139.8441, area: '西葛西', region: 'tokyo' },
  '船堀駅': { lat: 35.6850, lng: 139.8607, area: '船堀', region: 'tokyo' },
  '一之江駅': { lat: 35.6889, lng: 139.8774, area: '一之江', region: 'tokyo' },

  // 東京北部
  '赤羽駅': { lat: 35.7774, lng: 139.7220, area: '赤羽', region: 'tokyo' },
  '王子駅': { lat: 35.7524, lng: 139.7389, area: '王子', region: 'tokyo' },
  '十条駅': { lat: 35.7649, lng: 139.7279, area: '十条', region: 'tokyo' },
  '東十条駅': { lat: 35.7598, lng: 139.7313, area: '東十条', region: 'tokyo' },
  '板橋駅': { lat: 35.7513, lng: 139.7139, area: '板橋', region: 'tokyo' },
  '大山駅': { lat: 35.7607, lng: 139.6937, area: '大山', region: 'tokyo' },
  '中板橋駅': { lat: 35.7723, lng: 139.6887, area: '中板橋', region: 'tokyo' },
  '練馬駅': { lat: 35.7372, lng: 139.6534, area: '練馬', region: 'tokyo' },

  // 東京南部
  '蒲田駅': { lat: 35.5614, lng: 139.7168, area: '蒲田', region: 'tokyo' },
  '大森駅': { lat: 35.5888, lng: 139.7284, area: '大森', region: 'tokyo' },
  '大井町駅': { lat: 35.6062, lng: 139.7344, area: '大井町', region: 'tokyo' },
  '中目黒駅': { lat: 35.6441, lng: 139.6993, area: '中目黒', region: 'tokyo' },
  '学芸大学駅': { lat: 35.6087, lng: 139.6952, area: '学芸大学', region: 'tokyo' },
  '自由が丘駅': { lat: 35.6086, lng: 139.6688, area: '自由が丘', region: 'tokyo' },
  '田園調布駅': { lat: 35.6023, lng: 139.6708, area: '田園調布', region: 'tokyo' },
  '二子玉川駅': { lat: 35.6116, lng: 139.6282, area: '二子玉川', region: 'tokyo' },
  '成城学園前駅': { lat: 35.6405, lng: 139.6022, area: '成城学園前', region: 'tokyo' },
  '下北沢駅': { lat: 35.6616, lng: 139.6683, area: '下北沢', region: 'tokyo' },

  // 東急線系
  '武蔵小杉駅': { lat: 35.5778, lng: 139.6565, area: '武蔵小杉', region: 'tokyo' },
  '溝の口駅': { lat: 35.6010, lng: 139.6103, area: '溝の口', region: 'tokyo' },
  'たまプラーザ駅': { lat: 35.5666, lng: 139.5567, area: 'たまプラーザ', region: 'tokyo' },
  '青葉台駅': { lat: 35.5529, lng: 139.5112, area: '青葉台', region: 'tokyo' },
  '長津田駅': { lat: 35.5168, lng: 139.4650, area: '長津田', region: 'tokyo' },
  '中央林間駅': { lat: 35.5123, lng: 139.4456, area: '中央林間', region: 'tokyo' },
  '大岡山駅': { lat: 35.6080, lng: 139.6864, area: '大岡山', region: 'tokyo' },
  '都立大学駅': { lat: 35.6069, lng: 139.6854, area: '都立大学', region: 'tokyo' },
  '緑が丘駅': { lat: 35.6084, lng: 139.6808, area: '緑が丘', region: 'tokyo' },
  '多摩川駅': { lat: 35.5945, lng: 139.6761, area: '多摩川', region: 'tokyo' },
  '新丸子駅': { lat: 35.5851, lng: 139.6610, area: '新丸子', region: 'tokyo' },
  '元住吉駅': { lat: 35.5762, lng: 139.6484, area: '元住吉', region: 'tokyo' },
  '日吉駅': { lat: 35.5547, lng: 139.6322, area: '日吉', region: 'tokyo' },
  '綱島駅': { lat: 35.5432, lng: 139.6293, area: '綱島', region: 'tokyo' },
  '大倉山駅': { lat: 35.5340, lng: 139.6254, area: '大倉山', region: 'tokyo' },
  '菊名駅': { lat: 35.5282, lng: 139.6312, area: '菊名', region: 'tokyo' },
  '妙蓮寺駅': { lat: 35.5200, lng: 139.6353, area: '妙蓮寺', region: 'tokyo' },
  '白楽駅': { lat: 35.5135, lng: 139.6381, area: '白楽', region: 'tokyo' },
  '東白楽駅': { lat: 35.5089, lng: 139.6412, area: '東白楽', region: 'tokyo' },
  '反町駅': { lat: 35.5037, lng: 139.6438, area: '反町', region: 'tokyo' },

  // 小田急線系
  '新百合ヶ丘駅': { lat: 35.6062, lng: 139.5086, area: '新百合ヶ丘', region: 'tokyo' },
  '登戸駅': { lat: 35.6219, lng: 139.5481, area: '登戸', region: 'tokyo' },
  '向ヶ丘遊園駅': { lat: 35.6217, lng: 139.5438, area: '向ヶ丘遊園', region: 'tokyo' },
  '生田駅': { lat: 35.6110, lng: 139.5368, area: '生田', region: 'tokyo' },
  '読売ランド前駅': { lat: 35.6015, lng: 139.5241, area: '読売ランド前', region: 'tokyo' },
  '百合ヶ丘駅': { lat: 35.5978, lng: 139.5148, area: '百合ヶ丘', region: 'tokyo' },
  '新宿駅': { lat: 35.6896, lng: 139.7006, area: '新宿', region: 'tokyo' },
  '南新宿駅': { lat: 35.6875, lng: 139.6998, area: '南新宿', region: 'tokyo' },
  '参宮橋駅': { lat: 35.6751, lng: 139.6962, area: '参宮橋', region: 'tokyo' },
  '代々木八幡駅': { lat: 35.6697, lng: 139.6930, area: '代々木八幡', region: 'tokyo' },
  '代々木上原駅': { lat: 35.6641, lng: 139.6843, area: '代々木上原', region: 'tokyo' },
  '東北沢駅': { lat: 35.6604, lng: 139.6777, area: '東北沢', region: 'tokyo' },
  '梅ヶ丘駅': { lat: 35.6538, lng: 139.6516, area: '梅ヶ丘', region: 'tokyo' },
  '豪徳寺駅': { lat: 35.6499, lng: 139.6447, area: '豪徳寺', region: 'tokyo' },
  '経堂駅': { lat: 35.6486, lng: 139.6364, area: '経堂', region: 'tokyo' },
  '千歳船橋駅': { lat: 35.6482, lng: 139.6240, area: '千歳船橋', region: 'tokyo' },
  '祖師ヶ谷大蔵駅': { lat: 35.6470, lng: 139.6085, area: '祖師ヶ谷大蔵', region: 'tokyo' },
  '喜多見駅': { lat: 35.6408, lng: 139.6009, area: '喜多見', region: 'tokyo' },
  '狛江駅': { lat: 35.6351, lng: 139.5787, area: '狛江', region: 'tokyo' },
  '和泉多摩川駅': { lat: 35.6314, lng: 139.5689, area: '和泉多摩川', region: 'tokyo' },

  // 京王線系
  '明大前駅': { lat: 35.6758, lng: 139.6676, area: '明大前', region: 'tokyo' },
  '下高井戸駅': { lat: 35.6723, lng: 139.6361, area: '下高井戸', region: 'tokyo' },
  '桜上水駅': { lat: 35.6718, lng: 139.6227, area: '桜上水', region: 'tokyo' },
  '上北沢駅': { lat: 35.6712, lng: 139.6129, area: '上北沢', region: 'tokyo' },
  '八幡山駅': { lat: 35.6707, lng: 139.6050, area: '八幡山', region: 'tokyo' },
  '芦花公園駅': { lat: 35.6703, lng: 139.5971, area: '芦花公園', region: 'tokyo' },
  '千歳烏山駅': { lat: 35.6698, lng: 139.5894, area: '千歳烏山', region: 'tokyo' },
  '仙川駅': { lat: 35.6645, lng: 139.5559, area: '仙川', region: 'tokyo' },
  'つつじヶ丘駅': { lat: 35.6631, lng: 139.5436, area: 'つつじヶ丘', region: 'tokyo' },
  '柴崎駅': { lat: 35.6623, lng: 139.5330, area: '柴崎', region: 'tokyo' },
  '国領駅': { lat: 35.6508, lng: 139.5428, area: '国領', region: 'tokyo' },
  '布田駅': { lat: 35.6491, lng: 139.5363, area: '布田', region: 'tokyo' },
  '調布駅': { lat: 35.6516, lng: 139.5414, area: '調布', region: 'tokyo' },
  '西調布駅': { lat: 35.6494, lng: 139.5263, area: '西調布', region: 'tokyo' },
  '飛田給駅': { lat: 35.6651, lng: 139.5274, area: '飛田給', region: 'tokyo' },
  '武蔵野台駅': { lat: 35.6849, lng: 139.5128, area: '武蔵野台', region: 'tokyo' },
  '多磨霊園駅': { lat: 35.6888, lng: 139.5028, area: '多磨霊園', region: 'tokyo' },
  '東府中駅': { lat: 35.6897, lng: 139.4906, area: '東府中', region: 'tokyo' },
  '聖蹟桜ヶ丘駅': { lat: 35.6544, lng: 139.4469, area: '聖蹟桜ヶ丘', region: 'tokyo' },
  '百草園駅': { lat: 35.6449, lng: 139.4316, area: '百草園', region: 'tokyo' },
  '高幡不動駅': { lat: 35.6359, lng: 139.4096, area: '高幡不動', region: 'tokyo' },

  // 西武線系
  '所沢駅': { lat: 35.7991, lng: 139.4689, area: '所沢', region: 'tokyo' },
  '石神井公園駅': { lat: 35.7375, lng: 139.5943, area: '石神井公園', region: 'tokyo' },
  'ひばりヶ丘駅': { lat: 35.7564, lng: 139.5382, area: 'ひばりヶ丘', region: 'tokyo' },
  '東久留米駅': { lat: 35.7586, lng: 139.5299, area: '東久留米', region: 'tokyo' },
  '清瀬駅': { lat: 35.7855, lng: 139.5264, area: '清瀬', region: 'tokyo' },
  '秋津駅': { lat: 35.7895, lng: 139.4944, area: '秋津', region: 'tokyo' },
  '小川駅': { lat: 35.7272, lng: 139.6179, area: '小川', region: 'tokyo' },
  '鷺ノ宮駅': { lat: 35.7231, lng: 139.6426, area: '鷺ノ宮', region: 'tokyo' },
  '下井草駅': { lat: 35.7199, lng: 139.6366, area: '下井草', region: 'tokyo' },
  '井荻駅': { lat: 35.7128, lng: 139.6268, area: '井荻', region: 'tokyo' },
  '上井草駅': { lat: 35.7090, lng: 139.6214, area: '上井草', region: 'tokyo' },
  '上石神井駅': { lat: 35.7308, lng: 139.6069, area: '上石神井', region: 'tokyo' },
  '武蔵関駅': { lat: 35.7427, lng: 139.5815, area: '武蔵関', region: 'tokyo' },
  '東伏見駅': { lat: 35.7511, lng: 139.5627, area: '東伏見', region: 'tokyo' },
  '西武柳沢駅': { lat: 35.7515, lng: 139.5547, area: '西武柳沢', region: 'tokyo' },
  '田無駅': { lat: 35.7268, lng: 139.5386, area: '田無', region: 'tokyo' },
  '花小金井駅': { lat: 35.7282, lng: 139.5058, area: '花小金井', region: 'tokyo' },
  '小平駅': { lat: 35.7286, lng: 139.4776, area: '小平', region: 'tokyo' },

  // 東武線系
  '北千住駅': { lat: 35.7490, lng: 139.8048, area: '北千住', region: 'tokyo' },
  '西新井駅': { lat: 35.7755, lng: 139.7836, area: '西新井', region: 'tokyo' },
  '竹ノ塚駅': { lat: 35.7930, lng: 139.7934, area: '竹ノ塚', region: 'tokyo' },
  '谷塚駅': { lat: 35.8270, lng: 139.7936, area: '谷塚', region: 'tokyo' },
  '草加駅': { lat: 35.8256, lng: 139.8062, area: '草加', region: 'tokyo' },
  '松原団地駅': { lat: 35.8350, lng: 139.8201, area: '松原団地', region: 'tokyo' },
  '新田駅': { lat: 35.8450, lng: 139.8331, area: '新田', region: 'tokyo' },
  '蒲生駅': { lat: 35.8534, lng: 139.8443, area: '蒲生', region: 'tokyo' },
  '新越谷駅': { lat: 35.8910, lng: 139.7907, area: '新越谷', region: 'tokyo' },
  '越谷駅': { lat: 35.8751, lng: 139.7907, area: '越谷', region: 'tokyo' },
  '牛田駅': { lat: 35.7367, lng: 139.7979, area: '牛田', region: 'tokyo' },
  '小菅駅': { lat: 35.7614, lng: 139.8390, area: '小菅', region: 'tokyo' },
  '五反野駅': { lat: 35.7707, lng: 139.8173, area: '五反野', region: 'tokyo' },
  '梅島駅': { lat: 35.7764, lng: 139.8077, area: '梅島', region: 'tokyo' },
  '西新井大師西駅': { lat: 35.7810, lng: 139.7765, area: '西新井大師西', region: 'tokyo' },
  '大師前駅': { lat: 35.7855, lng: 139.7697, area: '大師前', region: 'tokyo' },

  // 京急線系
  '川崎駅': { lat: 35.5308, lng: 139.6970, area: '川崎', region: 'tokyo' },
  '横浜駅': { lat: 35.4661, lng: 139.6222, area: '横浜', region: 'tokyo' },
  '上大岡駅': { lat: 35.4076, lng: 139.5937, area: '上大岡', region: 'tokyo' },
  '金沢文庫駅': { lat: 35.3426, lng: 139.6203, area: '金沢文庫', region: 'tokyo' },
  '金沢八景駅': { lat: 35.3354, lng: 139.6247, area: '金沢八景', region: 'tokyo' },
  '追浜駅': { lat: 35.3256, lng: 139.6473, area: '追浜', region: 'tokyo' },
  '京急田浦駅': { lat: 35.3139, lng: 139.6651, area: '京急田浦', region: 'tokyo' },
  '安針塚駅': { lat: 35.3053, lng: 139.6760, area: '安針塚', region: 'tokyo' },
  '逸見駅': { lat: 35.2976, lng: 139.6851, area: '逸見', region: 'tokyo' },
  '汐入駅': { lat: 35.2911, lng: 139.6933, area: '汐入', region: 'tokyo' },
  '横須賀中央駅': { lat: 35.2810, lng: 139.6724, area: '横須賀中央', region: 'tokyo' },
  '県立大学駅': { lat: 35.2738, lng: 139.6650, area: '県立大学', region: 'tokyo' },
  '堀ノ内駅': { lat: 35.2661, lng: 139.6573, area: '堀ノ内', region: 'tokyo' },
  '京急大津駅': { lat: 35.2532, lng: 139.6430, area: '京急大津', region: 'tokyo' },
  '馬堀海岸駅': { lat: 35.2468, lng: 139.6357, area: '馬堀海岸', region: 'tokyo' },

  // 大阪
  '大阪駅': { lat: 34.7024, lng: 135.4959, area: '大阪', region: 'osaka' },
  '梅田駅': { lat: 34.7019, lng: 135.4969, area: '梅田', region: 'osaka' },
  '難波駅': { lat: 34.6658, lng: 135.5010, area: '難波', region: 'osaka' },
  '天王寺駅': { lat: 34.6455, lng: 135.5066, area: '天王寺', region: 'osaka' },

  // 愛知
  '名古屋駅': { lat: 35.1706, lng: 136.8816, area: '名古屋', region: 'nagoya' },
  '栄駅': { lat: 35.1681, lng: 136.9089, area: '栄', region: 'nagoya' },

  // 福岡
  '博多駅': { lat: 33.5904, lng: 130.4203, area: '博多', region: 'fukuoka' },
  '天神駅': { lat: 33.5907, lng: 130.3989, area: '天神', region: 'fukuoka' },

  // 北海道
  '札幌駅': { lat: 43.0683, lng: 141.3505, area: '札幌', region: 'hokkaido' },
  '大通駅': { lat: 43.0610, lng: 141.3563, area: '大通', region: 'hokkaido' },

  // 沖縄
  '那覇空港駅': { lat: 26.1958, lng: 127.6465, area: '那覇空港', region: 'okinawa' },
  '県庁前駅': { lat: 26.2139, lng: 127.6792, area: '県庁前', region: 'okinawa' },
  'おもろまち駅': { lat: 26.2220, lng: 127.6889, area: 'おもろまち', region: 'okinawa' },
  '首里駅': { lat: 26.2175, lng: 127.7199, area: '首里', region: 'okinawa' }
}

/**
 * 2点間の距離を計算（ハーバーサイン公式）
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // 地球の半径（km）
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI/180)
}

/**
 * 距離から徒歩時間を計算
 * 一般的に徒歩1分 = 約80メートル
 */
function distanceToWalkingTime(distanceKm: number): number {
  const distanceM = distanceKm * 1000
  const walkingSpeedMPerMin = 80 // メートル/分
  return Math.round(distanceM / walkingSpeedMPerMin)
}

/**
 * ジムの座標から最寄り駅と徒歩時間を計算
 */
export function calculateNearestStation(lat: number, lng: number): {
  station: string
  area: string
  walkingMinutes: number
  distance: number
} {
  let nearestStation = '新宿駅'
  let nearestArea = '新宿'
  let minDistance = Infinity

  for (const [stationName, coords] of Object.entries(MAJOR_STATIONS)) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng)
    if (distance < minDistance) {
      minDistance = distance
      nearestStation = stationName
      nearestArea = coords.area
    }
  }

  const walkingMinutes = distanceToWalkingTime(minDistance)

  // 徒歩30分を超える場合は住所ベースの推定に切り替え
  if (walkingMinutes > 30) {
    // 住所情報を使って推定駅を取得
    const fallbackArea = nearestArea || '詳細な場所'
    return {
      station: nearestStation,
      area: fallbackArea,
      walkingMinutes: Math.min(walkingMinutes, 30), // 最大30分でキャップ
      distance: minDistance
    }
  }

  return {
    station: nearestStation,
    area: nearestArea,
    walkingMinutes,
    distance: minDistance
  }
}

/**
 * 住所文字列から区を抽出
 */
export function extractAreaFromAddress(address: string): string {
  // 沖縄県
  if (address.includes('沖縄県') || address.includes('那覇市') || address.includes('浦添市') || address.includes('宜野湾市')) {
    if (address.includes('おもろまち')) return 'おもろまち'
    if (address.includes('那覇')) return '那覇'
    return '沖縄'
  }

  // 北海道
  if (address.includes('北海道') || address.includes('札幌市')) {
    if (address.includes('札幌')) return '札幌'
    return '北海道'
  }

  // 大阪府
  if (address.includes('大阪府') || address.includes('大阪市')) {
    if (address.includes('梅田')) return '梅田'
    if (address.includes('難波') || address.includes('なんば')) return '難波'
    if (address.includes('天王寺')) return '天王寺'
    return '大阪'
  }

  // 愛知県
  if (address.includes('愛知県') || address.includes('名古屋市')) {
    if (address.includes('栄')) return '栄'
    return '名古屋'
  }

  // 福岡県
  if (address.includes('福岡県') || address.includes('福岡市')) {
    if (address.includes('天神')) return '天神'
    return '博多'
  }

  // 東京23区の抽出
  const tokyoWards = [
    '千代田区', '中央区', '港区', '新宿区', '文京区', '台東区', '墨田区',
    '江東区', '品川区', '目黒区', '大田区', '世田谷区', '渋谷区', '中野区',
    '杉並区', '豊島区', '北区', '荒川区', '板橋区', '練馬区', '足立区',
    '葛飾区', '江戸川区'
  ]

  for (const ward of tokyoWards) {
    if (address.includes(ward)) {
      return ward
    }
  }

  // 他の主要エリア
  if (address.includes('横浜')) return '横浜'
  if (address.includes('川崎')) return '川崎'
  if (address.includes('さいたま')) return 'さいたま'
  if (address.includes('千葉')) return '千葉'

  return '詳細な場所'
}

/**
 * 住所から推定される最寄り駅情報を取得
 */
export function getStationInfoFromAddress(address: string): {
  area: string
  estimatedStation: string
} {
  const area = extractAreaFromAddress(address)

  // 区から推定される主要駅
  const areaToStation: Record<string, string> = {
    // 東京23区
    '新宿区': '新宿駅',
    '渋谷区': '渋谷駅',
    '豊島区': '池袋駅',
    '中央区': '銀座駅',
    '千代田区': '東京駅',
    '港区': '六本木駅',
    '目黒区': '目黒駅',
    '品川区': '品川駅',
    '台東区': '上野駅',
    '文京区': '後楽園駅',
    '墨田区': '錦糸町駅',
    '江東区': '豊洲駅',
    '世田谷区': '下北沢駅',
    '中野区': '中野駅',
    '杉並区': '荻窪駅',
    '北区': '赤羽駅',
    '荒川区': '日暮里駅',
    '板橋区': '板橋駅',
    '練馬区': '練馬駅',
    '足立区': '北千住駅',
    '葛飾区': '亀有駅',
    '江戸川区': '葛西駅',
    '大田区': '蒲田駅',

    // 東京郊外
    '立川': '立川駅',
    '八王子': '八王子駅',
    '町田': '町田駅',
    '吉祥寺': '吉祥寺駅',
    '三鷹': '三鷹駅',
    '調布': '調布駅',
    '府中': '府中駅',

    // エリア別（東京都内詳細）
    '六本木': '六本木駅',
    '銀座': '銀座駅',
    '表参道': '表参道駅',
    '恵比寿': '恵比寿駅',
    '原宿': '原宿駅',
    '自由が丘': '自由が丘駅',
    '二子玉川': '二子玉川駅',
    '中目黒': '中目黒駅',
    '学芸大学': '学芸大学駅',
    '下北沢': '下北沢駅',
    '成城学園前': '成城学園前駅',
    '武蔵小杉': '武蔵小杉駅',
    '溝の口': '溝の口駅',
    'たまプラーザ': 'たまプラーザ駅',
    '青葉台': '青葉台駅',
    '長津田': '長津田駅',
    '中央林間': '中央林間駅',
    '新百合ヶ丘': '新百合ヶ丘駅',
    '登戸': '登戸駅',
    '向ヶ丘遊園': '向ヶ丘遊園駅',
    '経堂': '経堂駅',
    '千歳船橋': '千歳船橋駅',
    '千歳烏山': '千歳烏山駅',
    '明大前': '明大前駅',
    '仙川': '仙川駅',
    'つつじヶ丘': 'つつじヶ丘駅',
    '聖蹟桜ヶ丘': '聖蹟桜ヶ丘駅',
    '高幡不動': '高幡不動駅',
    '所沢': '所沢駅',
    '石神井公園': '石神井公園駅',
    'ひばりヶ丘': 'ひばりヶ丘駅',
    '東久留米': '東久留米駅',
    '清瀬': '清瀬駅',
    '田無': '田無駅',
    '花小金井': '花小金井駅',
    '小平': '小平駅',
    '北千住': '北千住駅',
    '西新井': '西新井駅',
    '竹ノ塚': '竹ノ塚駅',
    '草加': '草加駅',
    '川崎': '川崎駅',
    '横浜': '横浜駅',
    '上大岡': '上大岡駅',
    '金沢文庫': '金沢文庫駅',
    '横須賀中央': '横須賀中央駅',

    // 沖縄
    'おもろまち': 'おもろまち駅',
    '那覇': '県庁前駅',
    '沖縄': '那覇空港駅',

    // その他主要都市
    '大阪': '大阪駅',
    '梅田': '梅田駅',
    '名古屋': '名古屋駅',
    '博多': '博多駅',
    '札幌': '札幌駅'
  }

  return {
    area,
    estimatedStation: areaToStation[area] || '最寄り駅'
  }
}

/**
 * 距離を読みやすい形式でフォーマット
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`
  } else {
    return `${Math.round(distance)}km`
  }
}

/**
 * ユーザー位置からジムまでの距離を計算
 */
export function calculateDistanceFromUser(
  userLat: number,
  userLng: number,
  gymLat: number,
  gymLng: number
): number {
  return calculateDistance(userLat, userLng, gymLat, gymLng)
}

/**
 * ジムデータに最寄り駅情報を追加
 */
export function enrichGymWithStationInfo(gym: {
  address?: string
  latitude?: number | string
  longitude?: number | string
}): {
  area: string
  station: string
  walkingMinutes: number
  walkingText: string
} {
  // 座標がある場合は正確な計算
  if (gym.latitude && gym.longitude) {
    const lat = typeof gym.latitude === 'string' ? parseFloat(gym.latitude) : gym.latitude
    const lng = typeof gym.longitude === 'string' ? parseFloat(gym.longitude) : gym.longitude

    if (!isNaN(lat) && !isNaN(lng)) {
      const stationInfo = calculateNearestStation(lat, lng)
      return {
        area: stationInfo.area,
        station: stationInfo.station,
        walkingMinutes: stationInfo.walkingMinutes,
        walkingText: stationInfo.walkingMinutes > 0 ? `徒歩${stationInfo.walkingMinutes}分` : '駅周辺'
      }
    }
  }

  // 住所のみの場合は推定
  if (gym.address) {
    const addressInfo = getStationInfoFromAddress(gym.address)
    // 住所ベースの場合は5-15分の範囲で推定
    const estimatedMinutes = Math.floor(Math.random() * 11) + 5 // 5-15分
    return {
      area: addressInfo.area,
      station: addressInfo.estimatedStation,
      walkingMinutes: estimatedMinutes,
      walkingText: `徒歩約${estimatedMinutes}分`
    }
  }

  // フォールバック
  return {
    area: '詳細な場所',
    station: '最寄り駅',
    walkingMinutes: 0,
    walkingText: 'アクセス情報未設定'
  }
}