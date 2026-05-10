# WINTERFELL LAYOUT | ระบบจัดการรายชื่อสมาชิก

ระบบจัดการรายชื่อสมาชิกสุดพรีเมียมสำหรับ **Layout Lady** มาพร้อมกับดีไซน์ Glassmorphism ที่ทันสมัย, ระบบเพลงพื้นหลัง และระบบจัดการหลังบ้านที่ใช้งานง่าย

## 🚀 คุณสมบัติเด่น

- **ระบบจัดการรายชื่อแบบไดนามิก**: จัดกลุ่มตามหมวดหมู่และตำแหน่งอย่างเป็นระเบียบ
- **แผงควบคุมแอดมิน (Admin Dashboard)**: จัดการหมวดหมู่, ตำแหน่ง และสมาชิกได้อย่างง่ายดาย
- **ปรับแต่งได้เต็มที่**: เปลี่ยนรูปพื้นหลังและเพลงพื้นหลัง (.mp3) ได้โดยตรงจากหน้าตั้งค่า
- **ดีไซน์ระดับพรีเมียม**: เอฟเฟกต์โปร่งแสง (Glassmorphism), แอนิเมชันที่ลื่นไหล และรองรับทุกหน้าจอ (Responsive)
- **ระบบความปลอดภัย**: ล็อกอินแอดมินด้วยระบบ Session-based cookies ที่ปลอดภัย

## 🛠️ เทคโนโลยีที่ใช้

- **Framework**: Next.js 15+ (App Router)
- **Database**: MongoDB พร้อม Prisma ORM
- **Styling**: Vanilla CSS Modules + Lucide Icons
- **Authentication**: JWT + Bcryptjs

## 📦 วิธีการติดตั้งและใช้งาน (Local)

1.  **ติดตั้ง dependencies**:
    ```bash
    npm install
    ```
2.  **ตั้งค่า Environment Variables**:
    สร้างไฟล์ `.env` ที่ root directory:
    ```env
    DATABASE_URL="mongodb+srv://..."
    JWT_SECRET="รหัสลับของคุณ"
    ```
3.  **สร้าง Prisma Client**:
    ```bash
    npx prisma generate
    ```
4.  **เริ่มรันโปรเจกต์**:
    ```bash
    npm run dev
    ```

## 🌐 การติดตั้งบน Vercel (Deployment)

1.  นำโค้ดขึ้น GitHub
2.  ไปที่เว็บไซต์ [Vercel.com](https://vercel.com) และกด Import โปรเจกต์
3.  เพิ่ม Environment Variables (`DATABASE_URL` และ `JWT_SECRET`) ในหน้าตั้งค่าของ Vercel
4.  ตั้งค่า Build Command (ถ้าจำเป็น): `npx prisma generate && next build`
5.  กด Deploy!

## 🔐 ข้อมูลการเข้าถึงแอดมิน

- **ลิงก์ล็อกอิน**: `/admin/login`
- **รหัสผ่านเริ่มต้น**: `admin123` (สามารถเปลี่ยนได้ที่หน้าตั้งค่าหลังจากล็อกอินแล้ว)
