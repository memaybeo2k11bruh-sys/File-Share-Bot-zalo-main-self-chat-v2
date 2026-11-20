HNNP STUDIO - SELF COMMAND PATCH

Ban nay sua:
- Bat listener nhan tin do chinh tai khoan Zalo dang dang nhap gui.
- Nhan dien tin tu tai khoan bot bang ca co isSelf va UID tai khoan.
- Cho phep lenh co prefix tu chinh tai khoan di qua rental/unknown-command guard.
- Bo qua background hooks cho tin tu chinh tai khoan de tranh vong lap.
- Sua loi thut lech YAML cua admin_bot/support_bot trong config.yml.
- Them test router cho truong hop UID nguoi gui trung UID tai khoan bot.

CAI DAT:
1. Tat bot bang Ctrl+C.
2. Giai nen ZIP vao mot thu muc rieng.
3. Copy ma nguon trong ZIP vao thu muc bot dang dung va cho phep ghi de.
4. GIU LAI cac du lieu rieng tu thu muc cu: .env, App/Session.json,
   App/Session.key, cac file Session.json.bak*, Data/ va node_modules/.
5. Neu thu muc moi chua cai dependencies, chay: npm.cmd install
6. Chay: npm.cmd start

KIEM TRA:
- Gui !ping trong mot nhom co tai khoan bot.
- Xem PowerShell co log "Nhan tin nhan tu chinh tai khoan bot" khong.
- Neu !gpt bao RENT INACTIVE, do la gioi han thue cua lenh AI, khong phai loi self-command.

GHI CHU:
Da kiem tra cu phap 216 file JavaScript, YAML config va test router co lap.
Chua the xac minh dang nhap/giao tiep Zalo thuc te tren tai khoan cua ban.
Khong chia se session, Session.key, QR hoac file .env co khoa bi mat.
