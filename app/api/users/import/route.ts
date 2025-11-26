import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Dynamic import for xlsx (will be installed)
let XLSX: any = null;
try {
  XLSX = require("xlsx");
} catch (error) {
  // xlsx not installed yet
}

// POST - Import users from Excel file
export async function POST(request: NextRequest) {
  try {
    // Check if xlsx is installed
    if (!XLSX) {
      return NextResponse.json(
        { success: false, error: "Thư viện xlsx chưa được cài đặt. Vui lòng chạy: npm install xlsx" },
        { status: 500 }
      );
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Không có file được tải lên" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Chỉ chấp nhận file Excel (.xlsx, .xls)" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: "File Excel không có dữ liệu" },
        { status: 400 }
      );
    }

    // Expected columns: Email, FullName, Password, Phone, Role, Address, City, State, ZipCode, Country, DateOfBirth, Gender, Status
    const usersToCreate: any[] = [];
    const errors: string[] = [];
    const skipped: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      const rowNumber = i + 2; // +2 because Excel rows start at 1 and we have header

      try {
        // Required fields
        const email = row.Email || row.email || row["Email"] || "";
        const fullName = row.FullName || row.fullName || row["Full Name"] || row["Họ tên"] || "";
        const password = row.Password || row.password || row["Mật khẩu"] || "123456"; // Default password

        if (!email || !fullName) {
          errors.push(`Dòng ${rowNumber}: Thiếu Email hoặc Họ tên`);
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          skipped.push(`Dòng ${rowNumber}: Email ${email} đã tồn tại`);
          continue;
        }

        // Optional fields
        const phone = row.Phone || row.phone || row["Số điện thoại"] || "";
        const role = (row.Role || row.role || row["Vai trò"] || "user").toLowerCase();
        const address = row.Address || row.address || row["Địa chỉ"] || "";
        const city = row.City || row.city || row["Thành phố"] || "";
        const state = row.State || row.state || row["Tỉnh"] || "";
        const zipCode = row.ZipCode || row.zipCode || row["Mã bưu điện"] || "";
        const country = row.Country || row.country || row["Quốc gia"] || "Australia";
        const dateOfBirth = row.DateOfBirth || row.dateOfBirth || row["Ngày sinh"] || null;
        const gender = row.Gender || row.gender || row["Giới tính"] || null;
        const status = (row.Status || row.status || row["Trạng thái"] || "active").toLowerCase();

        // Validate role
        const validRole = role === "admin" ? "admin" : "user";
        
        // Validate status
        const validStatus = ["active", "inactive", "banned"].includes(status) ? status : "active";

        // Validate gender
        let validGender = null;
        if (gender) {
          const genderLower = gender.toLowerCase();
          if (["male", "nam", "m"].includes(genderLower)) validGender = "male";
          else if (["female", "nữ", "f"].includes(genderLower)) validGender = "female";
          else if (["other", "khác", "o"].includes(genderLower)) validGender = "other";
        }

        // Parse date of birth
        let parsedDateOfBirth: Date | null = null;
        if (dateOfBirth) {
          const date = new Date(dateOfBirth);
          if (!isNaN(date.getTime())) {
            parsedDateOfBirth = date;
          }
        }

        // Hash password
        const defaultPassword = password || "123456";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        usersToCreate.push({
          email: email.toLowerCase(),
          password: hashedPassword,
          fullName: fullName.trim(),
          phone: phone ? phone.toString().trim() : null,
          role: validRole,
          address: address ? address.trim() : null,
          city: city ? city.trim() : null,
          state: state ? state.trim() : null,
          zipCode: zipCode ? zipCode.toString().trim() : null,
          country: country ? country.trim() : country,
          dateOfBirth: parsedDateOfBirth,
          gender: validGender,
          status: validStatus,
        });
      } catch (error: any) {
        errors.push(`Dòng ${rowNumber}: ${error.message}`);
      }
    }

    if (usersToCreate.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Không có người dùng nào để tạo",
          errors: errors,
          skipped: skipped,
        },
        { status: 400 }
      );
    }

    // Create users
    const createdUsers = await User.insertMany(usersToCreate);

    const result = {
      success: true,
      message: `Đã tạo thành công ${createdUsers.length} người dùng`,
      created: createdUsers.length,
      total: data.length,
      errors: errors.length > 0 ? errors : undefined,
      skipped: skipped.length > 0 ? skipped : undefined,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error importing users:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Không thể import file Excel" },
      { status: 500 }
    );
  }
}

