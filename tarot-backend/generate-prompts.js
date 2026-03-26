import fs from 'fs';

const MAJOR_ARCANA = [
  { id: "m0", name: "THE FOOL", icon: "Hầu Vương (Khỉ)", desc: "Một thiếu niên mang dáng dấp Hầu Vương (Khỉ), mặc áo vải đơn sơ, vác gậy trúc, bước đi tinh nghịch trên rìa vách đá cao. Phía xa là mặt trời mọc rực rỡ.", color: "tươi sáng, huyền ảo" },
  { id: "m1", name: "THE MAGICIAN", icon: "Xà Thần (Rắn)", desc: "Một vị Xà Thần đầy mị lực. Một tay chỉ lên trời, một tay chỉ xuống đất. Trước mặt có 4 bảo vật: Cốc, Kiếm, Gậy, và Tiền vàng. Trên đầu tỏa ra ánh sáng hình vô cực.", color: "tím pastel và vàng kim" },
  { id: "m2", name: "THE HIGH PRIESTESS", icon: "Miêu Nữ (Mèo)", desc: "Một Miêu Nữ (cô gái có tai mèo) thanh cao, mặc y phục lụa mỏng. Nàng ngồi tĩnh lặng giữa hai cây cột lớn (trắng và đen), dưới chân là vầng trăng khuyết.", color: "xanh lam sẫm và bạc" },
  { id: "m3", name: "THE EMPRESS", icon: "Thánh Mẫu (Dê/Lợn)", desc: "Một vị Thánh Mẫu (thiếu nữ có sừng dê bằng ngọc) đại diện cho Mẹ Thiên Nhiên. Nàng ngồi đĩnh đạc trên ngai giữa cánh đồng lúa chín vàng và hoa mẫu đơn rực rỡ.", color: "xanh lục ngọc bích và vàng kim" },
  { id: "m4", name: "THE EMPEROR", icon: "Long Thần (Rồng)", desc: "Một vị Long Thần oai phong lẫm liệt, có sừng rồng, mặc hoàng bào đỏ sậm và vàng kim. Ngài ngồi vững chãi trên ngai vàng chạm trổ vảy rồng.", color: "đỏ sậm và vàng kim uy nghi" },
  { id: "m5", name: "THE HIEROPHANT", icon: "Ngưu Thần (Trâu)", desc: "Một vị Ngưu Thần (đầu trâu mình người) hiền từ và uy nghiêm. Ngài mặc pháp phục, ngồi tĩnh tọa trong đền cổ kính, tay cầm tích trượng nạm ngọc.", color: "vàng kim, đỏ tía, trầm mộc" },
  { id: "m6", name: "THE LOVERS", icon: "Tiên Đồng Ngọc Nữ (Gà/Phượng Hoàng)", desc: "Đôi tiên đồng ngọc nữ mang họa tiết lông vũ Phượng Hoàng đang nắm tay nhau âu yếm. Phía trên cao là một vị Tiên Nữ giang rộng đôi cánh ban phước lành.", color: "hồng đào, vàng kim, xanh lam ngọc" },
  { id: "m7", name: "THE CHARIOT", icon: "Thần Tướng và Thần Mã (Ngựa)", desc: "Một vị thần tướng trẻ tuổi mặc chiến giáp lấp lánh, đứng trên cỗ xe được kéo bởi hai con thần mã (trắng và đen) đang phi nước đại giữa mây gió.", color: "vàng kim, xanh sẫm, trắng, đen" },
  { id: "m8", name: "STRENGTH", icon: "Tiên Nữ và Bạch Hổ (Hổ)", desc: "Một tiên nữ điềm tĩnh, mặc y phục trắng vàng, đang dùng tay không vuốt ve êm ái đầu một con Bạch Hổ hung tợn, khiến nó ngoan ngoãn khuất phục.", color: "trắng tuyền, xanh trúc, vàng nắng" },
  { id: "m9", name: "THE HERMIT", icon: "Hiền Triết (Chuột)", desc: "Một vị hiền triết lão thành (có nét ẩn dụ của loài chuột trắng), mặc áo choàng đạo sĩ, đứng trên đỉnh núi tuyết. Tay giơ cao chiếc đèn lồng lấp lánh.", color: "xanh đêm, trắng tuyết, ánh vàng ấm áp" },
  { id: "m10", name: "WHEEL OF FORTUNE", icon: "Trư Thần (Lợn)", desc: "Một vị Trư Thần phúc hậu mặc y phục gấm vóc lộng lẫy. Ngài đang xoay một chiếc Luân Bàn vũ trụ khổng lồ phát sáng, xung quanh là cơn mưa tiền vàng.", color: "đỏ, vàng kim, xanh lam vũ trụ" },
  { id: "m11", name: "JUSTICE", icon: "Khuyển Thần (Chó)", desc: "Một vị Khuyển Thần (đầu sói/thiên cẩu) nghiêm nghị, mặc chiến bào. Một tay giơ cao thanh gươm sắc bén, tay kia nâng chiếc cân tiểu ly vàng cân bằng tuyệt đối.", color: "đỏ sậm, vàng kim, xám đá" },
  { id: "m12", name: "THE HANGED MAN", icon: "Tiên Nhân Hồ Ly 9 Đuôi", desc: "Một vị tiên nhân Hồ Ly 9 đuôi thanh tao, đang treo ngược người lơ lửng trên cành cây hoa đào cổ thụ bằng một dải lụa, hai mắt nhắm nghiền tĩnh tu.", color: "tím nhạt, hồng đào, xanh rêu" },
  { id: "m13", name: "DEATH", icon: "Thần Cai Quản Cõi Âm", desc: "Một vị thần cai quản cõi âm tao nhã, tóc bạc, mặc y phục đen tuyền và bạc. Ngài bước đi chậm rãi giữa cánh đồng Hoa Bỉ Ngạn đỏ rực dưới màn đêm.", color: "đen, bạc, và đỏ rực" },
  { id: "m14", name: "TEMPERANCE", icon: "Thủy Tiên (Tiên Nữ)", desc: "Một vị Thủy Tiên tuyệt đẹp đang đứng một chân trên đá, một chân chạm mặt hồ. Nàng đang rót dòng nước ma thuật phát sáng luân chuyển hoàn hảo giữa hai bình ngọc.", color: "đỏ san hô và xanh lam ngọc" },
  { id: "m15", name: "THE DEVIL", icon: "Ngưu Ma Vương", desc: "Một vị Ngưu Ma Vương khổng lồ, hung tợn, ngồi trên ngai vàng phủ đầy châu báu. Dưới chân là hai người đang bị trói buộc lỏng lẻo bằng xích vàng.", color: "đen sâu thẳm, đỏ lốc, vàng kim" },
  { id: "m16", name: "THE TOWER", icon: "Bảo Tháp (Cửu Trùng Tháp)", desc: "Một Bảo Tháp Á Đông tráng lệ bị một tia sét khổng lồ giáng thẳng xuống làm vỡ nát ngói. Lửa bùng phát dữ dội, hai bóng người đang rơi tự do xuống vách đá.", color: "đen bão tố, trắng xanh tia sét, đỏ rực" },
  { id: "m17", name: "THE STAR", icon: "Tinh Nữ (Tiên Nữ)", desc: "Một vị Tinh Nữ thanh tao quỳ bên hồ nước trong vắt, tay cầm bình ngọc đổ dòng nước cam lộ. Trên trời, một ngôi sao Bắc Đẩu khổng lồ tỏa sáng rực rỡ.", color: "xanh dương thẳm, bạc, tím, vàng kim" },
  { id: "m18", name: "THE MOON", icon: "Bạch Lang (Sói Trắng)", desc: "Một chú Bạch Lang (sói trắng) khổng lồ phát sáng đang đứng trên mỏm đá ngửa mặt hú vang. Phía trên là vầng trăng tròn khổng lồ ma mị ẩn hiện trong sương mù.", color: "xanh bóng đêm, bạc, đen thẳm" },
  { id: "m19", name: "THE SUN", icon: "Thái Dương Thần và Hỏa Điểu", desc: "Một vị Thái Dương Thần rạng rỡ mặc y phục vàng kim đỏ rực, bay lượn trên lưng một con Hỏa Điểu (Phượng Hoàng Lửa). Phía sau là mặt trời chói lọi.", color: "vàng kim, đỏ cam, trắng sáng" },
  { id: "m20", name: "JUDGEMENT", icon: "Thần Tướng Nhà Trời", desc: "Một vị Thần Tướng uy nghi giáng trần từ đám mây ngũ sắc, thổi chiếc tù và khổng lồ. Bên dưới, những đóa hoa sen vàng đồng loạt nở rộ từ mặt nước sương mù.", color: "vàng rực, trắng mây, xanh lam ngọc" },
  { id: "m21", name: "THE WORLD", icon: "Thần Nữ Vũ Trụ và Tứ Tượng", desc: "Một vị Thần Nữ Vũ Trụ tuyệt mỹ say sưa nhảy múa giữa vòng tròn Thái Cực phát sáng. Bốn góc là mờ ảo hình ảnh Tứ Tượng (Thanh Long, Bạch Hổ, Chu Tước, Huyền Vũ).", color: "vàng kim, xanh vũ trụ, đỏ tía" }
];

const SUITS = [
  { name: "Wands", vn: "Gậy", icon: "Ngọc trượng phát sáng", color: "vàng kim và cam lửa" },
  { name: "Cups", vn: "Cốc", icon: "Chén ngọc lưu ly", color: "xanh dương và hồng đào" },
  { name: "Swords", vn: "Kiếm", icon: "Thanh kiếm cổ sắc bén", color: "xám đen và xanh thép bão tố" },
  { name: "Pentacles", vn: "Tiền", icon: "Đồng tiền xu vàng Á Đông", color: "vàng rực rỡ và xanh ngọc bích" }
];

const RANKS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Page", "Knight", "Queen", "King"];

let allPrompts = "DANH SÁCH 78 PROMPTS TẠO ẢNH TRỌN BỘ BÀI TAROT\n\n";

allPrompts += `=========== PHẦN 1: BỘ ẨN CHÍNH (MAJOR ARCANA) ===========\n\n`;

MAJOR_ARCANA.forEach(card => {
  allPrompts += `[Lưu ảnh thành: ${card.id}.jpg]\n`;
  allPrompts += `Hãy tạo cho tôi một hình ảnh dọc (tỷ lệ 9:16) thiết kế thành một lá bài Tarot hoàn chỉnh.
Chủ đề: Thần thoại Á Đông (Eastern Fantasy).
Biểu tượng chính: ${card.icon}.
Mô tả chi tiết: ${card.desc}
Phong cách nghệ thuật: Tranh Digital Art, đậm chất Kỳ ảo Á Đông, chi tiết tinh xảo, màu sắc thiên về ${card.color}.
YÊU CẦU QUAN TRỌNG VỀ BỐ CỤC: Khung viền ngoài cùng của lá bài PHẢI ĐỒNG NHẤT: sử dụng họa tiết rồng phượng cuộn vào nhau và các biểu tượng của 12 con giáp cách điệu, kết hợp với mây ngũ sắc mang đậm nét thần thoại Á Đông. Ở chính giữa mép dưới cùng của lá bài, hãy vẽ một dải băng (ribbon) sang trọng, bên trong viết chính xác dòng chữ in hoa: "${card.name}" thật to, rõ nét và căn giữa.\n\n`;
});

allPrompts += `=========== PHẦN 2: BỘ ẨN PHỤ (MINOR ARCANA) ===========\n\n`;

SUITS.forEach(suit => {
  allPrompts += `--- BỘ ${suit.name.toUpperCase()} (${suit.vn}) ---\n\n`;
  
  RANKS.forEach((rank, index) => {
    const cardName = `${rank} OF ${suit.name.toUpperCase()}`;
    const fileName = `${suit.name.toLowerCase()}_${index + 1}.jpg`;
    
    allPrompts += `[Lưu ảnh thành: ${fileName}]\n`;
    allPrompts += `Hãy tạo cho tôi một hình ảnh dọc (tỷ lệ 9:16) thiết kế thành một lá bài Tarot hoàn chỉnh.
Chủ đề: Thần thoại Á Đông (Eastern Fantasy).
Biểu tượng chính: ${rank === 'Ace' ? '1' : rank} ${suit.icon}.
Mô tả chi tiết: Một khung cảnh thần thoại kỳ ảo tôn vinh ${suit.icon} lơ lửng giữa không trung.
Phong cách nghệ thuật: Tranh Digital Art, đậm chất Kỳ ảo Á Đông, chi tiết tinh xảo, màu sắc thiên về ${suit.color}.
YÊU CẦU QUAN TRỌNG VỀ BỐ CỤC: Khung viền ngoài cùng của lá bài PHẢI ĐỒNG NHẤT: sử dụng họa tiết rồng phượng cuộn vào nhau và các biểu tượng của 12 con giáp cách điệu, kết hợp với mây ngũ sắc mang đậm nét thần thoại Á Đông. Ở chính giữa mép dưới cùng của lá bài, hãy vẽ một dải băng (ribbon) sang trọng, bên trong viết chính xác dòng chữ in hoa: "${cardName}" thật to, rõ nét và căn giữa.\n\n`;
  });
});

fs.writeFileSync('prompts.txt', allPrompts, 'utf-8');
console.log("✅ Đã tạo thành công file prompts.txt chứa toàn bộ 78 câu lệnh!");