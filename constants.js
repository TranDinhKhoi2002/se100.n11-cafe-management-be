/**
 * Define enum for models
 */

// Product States
const productStates = {
    ACTIVE: 'Đang bán',
    PAUSE: 'Nghỉ bán'
};

// Receipt States
const receiptStates = {
    UNPAID: "Chưa thanh toán",
    PAID: "Đã thanh toán",
    CANCLED: "Đã hủy",
};

// Role Names
const roleNames = {
    OWNER: "Chủ quán",
    MANAGER: "Quản lý",
    STAFF: "Nhân viên",
};

// Table States
const tableStates = {
    READY: "Còn trống",
    USING: "Đang dùng",
};

// User: Gender & Status
const genders = {
    MALE: "Name",
    FEMALE: "Nữ"
};

const userStatus = {
    ACTIVE: "Đang làm",
    NONACTIVE: "Đã nghỉ"
};

module.exports = {
    productStates, 
    receiptStates,
    roleNames,
    tableStates,
    genders,
    userStatus
}