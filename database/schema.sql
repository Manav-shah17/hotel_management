-- ============================================
-- HOTEL MANAGEMENT SYSTEM - MySQL Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS hotel_management;
USE hotel_management;

-- ============================================
-- TABLE: Hotel
-- ============================================
CREATE TABLE Hotel (
    hotel_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    star_rating TINYINT CHECK (star_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: Room
-- ============================================
CREATE TABLE Room (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    room_type ENUM('Single', 'Double', 'Suite', 'Deluxe', 'Twin') NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
    FOREIGN KEY (hotel_id) REFERENCES Hotel(hotel_id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: Guest
-- ============================================
CREATE TABLE Guest (
    guest_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    id_proof VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: Staff
-- ============================================
CREATE TABLE Staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(80),
    department VARCHAR(80),
    salary DECIMAL(10,2),
    FOREIGN KEY (hotel_id) REFERENCES Hotel(hotel_id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: Reservation
-- ============================================
CREATE TABLE Reservation (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled') DEFAULT 'Pending',
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES Guest(guest_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Room(room_id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: Payment
-- ============================================
CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('Cash', 'Credit Card', 'Debit Card', 'Online', 'UPI') NOT NULL,
    status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES Reservation(reservation_id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: Inventory
-- ============================================
CREATE TABLE Inventory (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(80),
    quantity_in_stock INT DEFAULT 0,
    reorder_level INT DEFAULT 10,
    unit_cost DECIMAL(10,2),
    FOREIGN KEY (hotel_id) REFERENCES Hotel(hotel_id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: Maintenance
-- ============================================
CREATE TABLE Maintenance (
    maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    staff_id INT,
    issue TEXT NOT NULL,
    status ENUM('Reported', 'In Progress', 'Resolved') DEFAULT 'Reported',
    reported_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES Room(room_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id) ON DELETE SET NULL
);

-- ============================================
-- TABLE: Feedback
-- ============================================
CREATE TABLE Feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    guest_id INT NOT NULL,
    rating TINYINT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES Reservation(reservation_id) ON DELETE CASCADE,
    FOREIGN KEY (guest_id) REFERENCES Guest(guest_id) ON DELETE CASCADE
);

-- ============================================
-- SEED DATA
-- ============================================
INSERT INTO Hotel (name, city, phone, star_rating) VALUES
('The Grand Palace', 'Mumbai', '+91-22-12345678', 5),
('Seaside Comfort Inn', 'Goa', '+91-832-9876543', 3),
('Royal Heritage Hotel', 'Jaipur', '+91-141-5554321', 4);

INSERT INTO Room (hotel_id, room_number, room_type, price_per_night, status) VALUES
(1, '101', 'Single', 2500.00, 'Available'),
(1, '102', 'Double', 4500.00, 'Available'),
(1, '201', 'Suite', 12000.00, 'Available'),
(1, '202', 'Deluxe', 7500.00, 'Occupied'),
(2, '101', 'Single', 1800.00, 'Available'),
(2, '102', 'Double', 3200.00, 'Available'),
(3, '301', 'Twin', 3800.00, 'Maintenance');

INSERT INTO Guest (first_name, last_name, email, phone, id_proof) VALUES
('Arjun', 'Sharma', 'arjun.sharma@email.com', '9876543210', 'Aadhar-1234'),
('Priya', 'Patel', 'priya.patel@email.com', '9812345678', 'Passport-AB123'),
('Rahul', 'Mehta', 'rahul.mehta@email.com', '9845678901', 'DL-MH1234');

INSERT INTO Staff (hotel_id, full_name, role, department, salary) VALUES
(1, 'Suresh Kumar', 'Manager', 'Management', 75000),
(1, 'Deepa Nair', 'Receptionist', 'Front Desk', 28000),
(1, 'Ramesh Singh', 'Technician', 'Maintenance', 22000),
(2, 'Anita Desai', 'Manager', 'Management', 60000);

INSERT INTO Reservation (guest_id, room_id, check_in_date, check_out_date, status, total_amount) VALUES
(1, 2, '2026-04-01', '2026-04-05', 'Checked-Out', 18000.00),
(2, 4, '2026-04-07', '2026-04-10', 'Checked-In', 22500.00),
(3, 1, '2026-04-10', '2026-04-12', 'Confirmed', 5000.00);

INSERT INTO Payment (reservation_id, amount, method, status) VALUES
(1, 18000.00, 'Credit Card', 'Completed'),
(2, 22500.00, 'UPI', 'Completed');

INSERT INTO Inventory (hotel_id, name, category, quantity_in_stock, reorder_level, unit_cost) VALUES
(1, 'Bath Towels', 'Linen', 150, 30, 250.00),
(1, 'Shampoo Bottles', 'Toiletries', 200, 50, 45.00),
(1, 'Mineral Water', 'Beverages', 300, 100, 25.00),
(2, 'Bed Sheets', 'Linen', 80, 20, 500.00);

INSERT INTO Maintenance (room_id, staff_id, issue, status) VALUES
(7, 3, 'AC not cooling properly', 'In Progress'),
(4, 3, 'Plumbing leak in bathroom', 'Reported');

INSERT INTO Feedback (reservation_id, guest_id, rating, comments) VALUES
(1, 1, 5, 'Excellent stay! Staff was very helpful and rooms were spotless.'),
(2, 2, 4, 'Great location, comfortable beds. Could improve breakfast options.');
