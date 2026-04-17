// frontend/controllers/controllers.js

// ============================================
// DASHBOARD CONTROLLER
// ============================================
app.controller('DashboardCtrl', function($scope, $http, API_URL) {
  $scope.stats = {};
  $scope.recentReservations = [];
  $scope.loading = true;

  $http.get(API_URL + '/dashboard/stats').then(function(res) {
    $scope.stats = res.data;
    $scope.recentReservations = res.data.recent_reservations || [];
    $scope.loading = false;
  }).catch(function() {
    $scope.loading = false;
    $scope.error = 'Failed to load dashboard data. Make sure the backend is running.';
  });

  $scope.getStatusBadge = function(status) {
    var map = {
      'Available': 'badge-green', 'Occupied': 'badge-orange', 'Maintenance': 'badge-red',
      'Confirmed': 'badge-blue', 'Pending': 'badge-yellow', 'Checked-In': 'badge-teal',
      'Checked-Out': 'badge-gray', 'Cancelled': 'badge-red'
    };
    return 'badge ' + (map[status] || 'badge-gray');
  };

  $scope.formatCurrency = function(val) {
    return '₹' + parseFloat(val || 0).toLocaleString('en-IN');
  };
});

app.controller('AuthCtrl', function($scope, $location, $rootScope) {
  $scope.authForm = { name: '', email: '', password: '' };
  $scope.authError = '';
  $scope.authSuccess = '';

  function getUsers() {
    var users = JSON.parse(localStorage.getItem('hotelAppUsers') || '[]');
    if (!users.length) {
      users = [{ name: 'Hotel Admin', email: 'admin@hotelpro.com', password: 'admin123' }];
      localStorage.setItem('hotelAppUsers', JSON.stringify(users));
    }
    return users;
  }

  function saveUsers(users) {
    localStorage.setItem('hotelAppUsers', JSON.stringify(users));
  }

  function resetAuthMessages() {
    $scope.authError = '';
    $scope.authSuccess = '';
  }

  $scope.login = function() {
    resetAuthMessages();

    if (!$scope.authForm.email || !$scope.authForm.password) {
      $scope.authError = 'Please enter both email and password.';
      return;
    }

    var user = getUsers().find(function(u) {
      return u.email.toLowerCase() === $scope.authForm.email.toLowerCase() && u.password === $scope.authForm.password;
    });

    if (!user) {
      $scope.authError = 'Invalid credentials. Use admin@hotelpro.com / admin123 or sign up for a new account.';
      return;
    }

    localStorage.setItem('hotelAppToken', user.email);
    localStorage.setItem('hotelAppUserEmail', user.email);
    localStorage.setItem('hotelAppUserName', user.name);
    $rootScope.isAuthenticated = true;
    $rootScope.currentUser = user.name || user.email;
    $location.path('/');
  };

  $scope.signup = function() {
    resetAuthMessages();

    if (!$scope.authForm.name || !$scope.authForm.email || !$scope.authForm.password) {
      $scope.authError = 'Please fill all fields to create your account.';
      return;
    }

    var users = getUsers();
    if (users.some(function(u) { return u.email.toLowerCase() === $scope.authForm.email.toLowerCase(); })) {
      $scope.authError = 'An account with that email already exists.';
      return;
    }

    users.push({
      name: $scope.authForm.name,
      email: $scope.authForm.email,
      password: $scope.authForm.password
    });

    saveUsers(users);
    $scope.authSuccess = 'Your account was created successfully. Please login.';
    $scope.authForm.password = '';
    $location.path('/login');
  };
});

// ============================================
// ROOMS CONTROLLER
// ============================================
app.controller('RoomsCtrl', function($scope, $http, API_URL) {
  $scope.rooms = [];
  $scope.hotels = [];
  $scope.showModal = false;
  $scope.editMode = false;
  $scope.formData = {};
  $scope.alertMsg = '';
  $scope.alertType = '';
  $scope.searchText = '';

  function loadRooms() {
    $http.get(API_URL + '/rooms').then(function(res) { $scope.rooms = res.data; });
  }

  function loadHotels() {
    $http.get(API_URL + '/hotels').then(function(res) { $scope.hotels = res.data; });
  }

  loadRooms();
  loadHotels();

  $scope.openAdd = function() {
    $scope.editMode = false;
    $scope.formData = { status: 'Available' };
    $scope.showModal = true;
  };

  $scope.openEdit = function(room) {
    $scope.editMode = true;
    $scope.formData = angular.copy(room);
    $scope.showModal = true;
  };

  $scope.closeModal = function() { $scope.showModal = false; };

  $scope.save = function() {
    var url = $scope.editMode ? API_URL + '/rooms/' + $scope.formData.room_id : API_URL + '/rooms';
    var method = $scope.editMode ? 'PUT' : 'POST';

    $http({ method: method, url: url, data: $scope.formData }).then(function() {
      $scope.showAlert($scope.editMode ? 'Room updated!' : 'Room added!', 'success');
      $scope.closeModal();
      loadRooms();
    }).catch(function(err) {
      $scope.showAlert(err.data.error || 'Error saving room', 'error');
    });
  };

  $scope.delete = function(id) {
    if (!confirm('Delete this room?')) return;
    $http.delete(API_URL + '/rooms/' + id).then(function() {
      $scope.showAlert('Room deleted!', 'success');
      loadRooms();
    });
  };

  $scope.showAlert = function(msg, type) {
    $scope.alertMsg = msg;
    $scope.alertType = type;
    setTimeout(function() { $scope.$apply(function() { $scope.alertMsg = ''; }); }, 3000);
  };

  $scope.getStatusBadge = function(status) {
    var map = { 'Available': 'badge-green', 'Occupied': 'badge-orange', 'Maintenance': 'badge-red' };
    return 'badge ' + (map[status] || 'badge-gray');
  };

  $scope.roomTypes = ['Single', 'Double', 'Suite', 'Deluxe', 'Twin'];
  $scope.statusOptions = ['Available', 'Occupied', 'Maintenance'];

  $scope.filteredRooms = function() {
    if (!$scope.searchText) return $scope.rooms;
    var q = $scope.searchText.toLowerCase();
    return $scope.rooms.filter(function(r) {
      return (r.room_number + r.room_type + r.hotel_name + r.status).toLowerCase().includes(q);
    });
  };
});

// ============================================
// GUESTS CONTROLLER
// ============================================
app.controller('GuestsCtrl', function($scope, $http, API_URL) {
  $scope.guests = [];
  $scope.showModal = false;
  $scope.editMode = false;
  $scope.formData = {};
  $scope.alertMsg = '';
  $scope.searchText = '';

  function loadGuests() {
    $http.get(API_URL + '/guests').then(function(res) { $scope.guests = res.data; });
  }
  loadGuests();

  $scope.openAdd = function() { $scope.editMode = false; $scope.formData = {}; $scope.showModal = true; };
  $scope.openEdit = function(g) { $scope.editMode = true; $scope.formData = angular.copy(g); $scope.showModal = true; };
  $scope.closeModal = function() { $scope.showModal = false; };

  $scope.save = function() {
    var url = $scope.editMode ? API_URL + '/guests/' + $scope.formData.guest_id : API_URL + '/guests';
    var method = $scope.editMode ? 'PUT' : 'POST';
    $http({ method: method, url: url, data: $scope.formData }).then(function() {
      $scope.showAlert($scope.editMode ? 'Guest updated!' : 'Guest added!', 'success');
      $scope.closeModal();
      loadGuests();
    }).catch(function(e) { $scope.showAlert(e.data.error || 'Error', 'error'); });
  };

  $scope.delete = function(id) {
    if (!confirm('Delete this guest?')) return;
    $http.delete(API_URL + '/guests/' + id).then(function() { $scope.showAlert('Guest deleted!', 'success'); loadGuests(); });
  };

  $scope.showAlert = function(msg, type) {
    $scope.alertMsg = msg; $scope.alertType = type;
    setTimeout(function() { $scope.$apply(function() { $scope.alertMsg = ''; }); }, 3000);
  };

  $scope.filteredGuests = function() {
    if (!$scope.searchText) return $scope.guests;
    var q = $scope.searchText.toLowerCase();
    return $scope.guests.filter(function(g) {
      return (g.first_name + g.last_name + g.email + g.phone).toLowerCase().includes(q);
    });
  };
});

// ============================================
// RESERVATIONS CONTROLLER
// ============================================
app.controller('ReservationsCtrl', function($scope, $http, API_URL) {
  $scope.reservations = [];
  $scope.guests = [];
  $scope.rooms = [];
  $scope.showModal = false;
  $scope.editMode = false;
  $scope.formData = {};
  $scope.alertMsg = '';
  $scope.searchText = '';
  $scope.calculatedTotal = null;

  function loadAll() {
    $http.get(API_URL + '/reservations').then(function(res) { $scope.reservations = res.data; });
    $http.get(API_URL + '/guests').then(function(res) { $scope.guests = res.data; });
    $http.get(API_URL + '/rooms').then(function(res) { $scope.rooms = res.data.filter(function(r) { return r.status === 'Available'; }); });
  }
  loadAll();

  $scope.openAdd = function() {
    $scope.editMode = false;
    $scope.formData = { status: 'Pending' };
    $scope.calculatedTotal = null;
    // Refresh available rooms
    $http.get(API_URL + '/rooms').then(function(res) {
      $scope.rooms = res.data.filter(function(r) { return r.status === 'Available'; });
    });
    $scope.showModal = true;
  };

  $scope.openEdit = function(r) {
    $scope.editMode = true;
    $scope.formData = angular.copy(r);
    $scope.formData.check_in_date = r.check_in_date ? r.check_in_date.substring(0, 10) : '';
    $scope.formData.check_out_date = r.check_out_date ? r.check_out_date.substring(0, 10) : '';
    $scope.calculatedTotal = r.total_amount;
    // For edit, include current room too
    $http.get(API_URL + '/rooms').then(function(res) { $scope.rooms = res.data; });
    $scope.showModal = true;
  };

  $scope.closeModal = function() { $scope.showModal = false; };

  $scope.calculateTotal = function() {
    if (!$scope.formData.room_id || !$scope.formData.check_in_date || !$scope.formData.check_out_date) return;
    var room = $scope.rooms.find(function(r) { return r.room_id == $scope.formData.room_id; });
    if (!room) return;
    var nights = Math.ceil((new Date($scope.formData.check_out_date) - new Date($scope.formData.check_in_date)) / (1000*60*60*24));
    if (nights > 0) $scope.calculatedTotal = room.price_per_night * nights;
    else $scope.calculatedTotal = null;
  };

  $scope.save = function() {
    var url = $scope.editMode ? API_URL + '/reservations/' + $scope.formData.reservation_id : API_URL + '/reservations';
    var method = $scope.editMode ? 'PUT' : 'POST';
    $http({ method: method, url: url, data: $scope.formData }).then(function(res) {
      $scope.showAlert('Reservation saved! Total: ₹' + (res.data.total_amount || ''), 'success');
      $scope.closeModal();
      loadAll();
    }).catch(function(e) { $scope.showAlert(e.data.error || 'Error', 'error'); });
  };

  $scope.delete = function(id) {
    if (!confirm('Delete this reservation?')) return;
    $http.delete(API_URL + '/reservations/' + id).then(function() { $scope.showAlert('Deleted!', 'success'); loadAll(); });
  };

  $scope.showAlert = function(msg, type) {
    $scope.alertMsg = msg; $scope.alertType = type;
    setTimeout(function() { $scope.$apply(function() { $scope.alertMsg = ''; }); }, 4000);
  };

  $scope.getStatusBadge = function(status) {
    var map = { 'Confirmed': 'badge-blue', 'Pending': 'badge-yellow', 'Checked-In': 'badge-teal', 'Checked-Out': 'badge-gray', 'Cancelled': 'badge-red' };
    return 'badge ' + (map[status] || 'badge-gray');
  };

  $scope.statusOptions = ['Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'];

  $scope.filteredReservations = function() {
    if (!$scope.searchText) return $scope.reservations;
    var q = $scope.searchText.toLowerCase();
    return $scope.reservations.filter(function(r) {
      return (r.guest_name + r.room_number + r.status + r.hotel_name).toLowerCase().includes(q);
    });
  };

  $scope.formatCurrency = function(val) { return '₹' + parseFloat(val || 0).toLocaleString('en-IN'); };
});

// ============================================
// STAFF CONTROLLER
// ============================================
app.controller('StaffCtrl', function($scope, $http, API_URL) {
  $scope.staff = [];
  $scope.hotels = [];
  $scope.showModal = false;
  $scope.editMode = false;
  $scope.formData = {};
  $scope.alertMsg = '';
  $scope.searchText = '';

  function loadAll() {
    $http.get(API_URL + '/staff').then(function(res) { $scope.staff = res.data; });
    $http.get(API_URL + '/hotels').then(function(res) { $scope.hotels = res.data; });
  }
  loadAll();

  $scope.openAdd = function() { $scope.editMode = false; $scope.formData = {}; $scope.showModal = true; };
  $scope.openEdit = function(s) { $scope.editMode = true; $scope.formData = angular.copy(s); $scope.showModal = true; };
  $scope.closeModal = function() { $scope.showModal = false; };

  $scope.save = function() {
    var url = $scope.editMode ? API_URL + '/staff/' + $scope.formData.staff_id : API_URL + '/staff';
    var method = $scope.editMode ? 'PUT' : 'POST';
    $http({ method: method, url: url, data: $scope.formData }).then(function() {
      $scope.showAlert('Staff saved!', 'success'); $scope.closeModal(); loadAll();
    }).catch(function(e) { $scope.showAlert(e.data.error || 'Error', 'error'); });
  };

  $scope.delete = function(id) {
    if (!confirm('Delete this staff member?')) return;
    $http.delete(API_URL + '/staff/' + id).then(function() { $scope.showAlert('Deleted!', 'success'); loadAll(); });
  };

  $scope.showAlert = function(msg, type) {
    $scope.alertMsg = msg; $scope.alertType = type;
    setTimeout(function() { $scope.$apply(function() { $scope.alertMsg = ''; }); }, 3000);
  };

  $scope.filteredStaff = function() {
    if (!$scope.searchText) return $scope.staff;
    var q = $scope.searchText.toLowerCase();
    return $scope.staff.filter(function(s) {
      return (s.full_name + s.role + s.department + s.hotel_name).toLowerCase().includes(q);
    });
  };

  $scope.formatCurrency = function(val) { return '₹' + parseFloat(val || 0).toLocaleString('en-IN'); };
});

// ============================================
// INVENTORY CONTROLLER
// ============================================
app.controller('InventoryCtrl', function($scope, $http, API_URL) {
  $scope.items = [];
  $scope.hotels = [];
  $scope.showModal = false;
  $scope.editMode = false;
  $scope.formData = {};
  $scope.alertMsg = '';
  $scope.searchText = '';

  function loadAll() {
    $http.get(API_URL + '/inventory').then(function(res) { $scope.items = res.data; });
    $http.get(API_URL + '/hotels').then(function(res) { $scope.hotels = res.data; });
  }
  loadAll();

  $scope.openAdd = function() { $scope.editMode = false; $scope.formData = {}; $scope.showModal = true; };
  $scope.openEdit = function(i) { $scope.editMode = true; $scope.formData = angular.copy(i); $scope.showModal = true; };
  $scope.closeModal = function() { $scope.showModal = false; };

  $scope.save = function() {
    var url = $scope.editMode ? API_URL + '/inventory/' + $scope.formData.item_id : API_URL + '/inventory';
    var method = $scope.editMode ? 'PUT' : 'POST';
    $http({ method: method, url: url, data: $scope.formData }).then(function() {
      $scope.showAlert('Item saved!', 'success'); $scope.closeModal(); loadAll();
    }).catch(function(e) { $scope.showAlert(e.data.error || 'Error', 'error'); });
  };

  $scope.delete = function(id) {
    if (!confirm('Delete this item?')) return;
    $http.delete(API_URL + '/inventory/' + id).then(function() { $scope.showAlert('Deleted!', 'success'); loadAll(); });
  };

  $scope.showAlert = function(msg, type) {
    $scope.alertMsg = msg; $scope.alertType = type;
    setTimeout(function() { $scope.$apply(function() { $scope.alertMsg = ''; }); }, 3000);
  };

  $scope.isLowStock = function(item) { return item.quantity_in_stock <= item.reorder_level; };

  $scope.filteredItems = function() {
    if (!$scope.searchText) return $scope.items;
    var q = $scope.searchText.toLowerCase();
    return $scope.items.filter(function(i) {
      return (i.name + i.category + i.hotel_name).toLowerCase().includes(q);
    });
  };
});

// ============================================
// MAINTENANCE CONTROLLER
// ============================================
app.controller('MaintenanceCtrl', function($scope, $http, API_URL) {
  $scope.records = [];
  $scope.rooms = [];
  $scope.staff = [];
  $scope.showModal = false;
  $scope.editMode = false;
  $scope.formData = {};
  $scope.alertMsg = '';
  $scope.searchText = '';

  function loadAll() {
    $http.get(API_URL + '/maintenance').then(function(res) { $scope.records = res.data; });
    $http.get(API_URL + '/rooms').then(function(res) { $scope.rooms = res.data; });
    $http.get(API_URL + '/staff').then(function(res) { $scope.staff = res.data; });
  }
  loadAll();

  $scope.openAdd = function() { $scope.editMode = false; $scope.formData = { status: 'Reported' }; $scope.showModal = true; };
  $scope.openEdit = function(m) { $scope.editMode = true; $scope.formData = angular.copy(m); $scope.showModal = true; };
  $scope.closeModal = function() { $scope.showModal = false; };

  $scope.save = function() {
    var url = $scope.editMode ? API_URL + '/maintenance/' + $scope.formData.maintenance_id : API_URL + '/maintenance';
    var method = $scope.editMode ? 'PUT' : 'POST';
    $http({ method: method, url: url, data: $scope.formData }).then(function() {
      $scope.showAlert('Saved!', 'success'); $scope.closeModal(); loadAll();
    }).catch(function(e) { $scope.showAlert(e.data.error || 'Error', 'error'); });
  };

  $scope.delete = function(id) {
    if (!confirm('Delete this record?')) return;
    $http.delete(API_URL + '/maintenance/' + id).then(function() { $scope.showAlert('Deleted!', 'success'); loadAll(); });
  };

  $scope.showAlert = function(msg, type) {
    $scope.alertMsg = msg; $scope.alertType = type;
    setTimeout(function() { $scope.$apply(function() { $scope.alertMsg = ''; }); }, 3000);
  };

  $scope.getStatusBadge = function(status) {
    var map = { 'Reported': 'badge-red', 'In Progress': 'badge-yellow', 'Resolved': 'badge-green' };
    return 'badge ' + (map[status] || 'badge-gray');
  };

  $scope.statusOptions = ['Reported', 'In Progress', 'Resolved'];

  $scope.filteredRecords = function() {
    if (!$scope.searchText) return $scope.records;
    var q = $scope.searchText.toLowerCase();
    return $scope.records.filter(function(r) {
      return (r.room_number + r.hotel_name + r.issue + r.status + (r.staff_name || '')).toLowerCase().includes(q);
    });
  };
});

// ============================================
// FEEDBACK CONTROLLER
// ============================================
app.controller('FeedbackCtrl', function($scope, $http, API_URL) {
  $scope.feedbacks = [];
  $scope.reservations = [];
  $scope.guests = [];
  $scope.showModal = false;
  $scope.formData = {};
  $scope.alertMsg = '';

  function loadAll() {
    $http.get(API_URL + '/feedback').then(function(res) { $scope.feedbacks = res.data; });
    $http.get(API_URL + '/reservations').then(function(res) { $scope.reservations = res.data; });
    $http.get(API_URL + '/guests').then(function(res) { $scope.guests = res.data; });
  }
  loadAll();

  $scope.openAdd = function() { $scope.formData = { rating: 5 }; $scope.showModal = true; };
  $scope.closeModal = function() { $scope.showModal = false; };

  $scope.save = function() {
    $http.post(API_URL + '/feedback', $scope.formData).then(function() {
      $scope.showAlert('Feedback submitted!', 'success'); $scope.closeModal(); loadAll();
    }).catch(function(e) { $scope.showAlert(e.data.error || 'Error', 'error'); });
  };

  $scope.delete = function(id) {
    if (!confirm('Delete this feedback?')) return;
    $http.delete(API_URL + '/feedback/' + id).then(function() { $scope.showAlert('Deleted!', 'success'); loadAll(); });
  };

  $scope.showAlert = function(msg, type) {
    $scope.alertMsg = msg; $scope.alertType = type;
    setTimeout(function() { $scope.$apply(function() { $scope.alertMsg = ''; }); }, 3000);
  };

  $scope.getStars = function(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); };
  $scope.ratings = [1, 2, 3, 4, 5];
});

// ============================================
// PAYMENTS CONTROLLER
// ============================================
app.controller('PaymentsCtrl', function($scope, $http, API_URL) {
  $scope.payments = [];
  $scope.reservations = [];
  $scope.showModal = false;
  $scope.editMode = false;
  $scope.formData = {};
  $scope.alertMsg = '';
  $scope.searchText = '';

  function loadAll() {
    $http.get(API_URL + '/payments').then(function(res) { $scope.payments = res.data; });
    $http.get(API_URL + '/reservations').then(function(res) { $scope.reservations = res.data; });
  }
  loadAll();

  $scope.openAdd = function() { $scope.editMode = false; $scope.formData = { status: 'Pending' }; $scope.showModal = true; };
  $scope.openEdit = function(p) { $scope.editMode = true; $scope.formData = angular.copy(p); $scope.showModal = true; };
  $scope.closeModal = function() { $scope.showModal = false; };

  $scope.prefillAmount = function() {
    var res = $scope.reservations.find(function(r) { return r.reservation_id == $scope.formData.reservation_id; });
    if (res) $scope.formData.amount = res.total_amount;
  };

  $scope.save = function() {
    var url = $scope.editMode ? API_URL + '/payments/' + $scope.formData.payment_id : API_URL + '/payments';
    var method = $scope.editMode ? 'PUT' : 'POST';
    $http({ method: method, url: url, data: $scope.formData }).then(function() {
      $scope.showAlert('Payment saved!', 'success'); $scope.closeModal(); loadAll();
    }).catch(function(e) { $scope.showAlert(e.data.error || 'Error', 'error'); });
  };

  $scope.delete = function(id) {
    if (!confirm('Delete this payment?')) return;
    $http.delete(API_URL + '/payments/' + id).then(function() { $scope.showAlert('Deleted!', 'success'); loadAll(); });
  };

  $scope.showAlert = function(msg, type) {
    $scope.alertMsg = msg; $scope.alertType = type;
    setTimeout(function() { $scope.$apply(function() { $scope.alertMsg = ''; }); }, 3000);
  };

  $scope.getStatusBadge = function(status) {
    var map = { 'Completed': 'badge-green', 'Pending': 'badge-yellow', 'Failed': 'badge-red', 'Refunded': 'badge-orange' };
    return 'badge ' + (map[status] || 'badge-gray');
  };

  $scope.methodOptions = ['Cash', 'Credit Card', 'Debit Card', 'Online', 'UPI'];
  $scope.statusOptions = ['Pending', 'Completed', 'Failed', 'Refunded'];

  $scope.filteredPayments = function() {
    if (!$scope.searchText) return $scope.payments;
    var q = $scope.searchText.toLowerCase();
    return $scope.payments.filter(function(p) {
      return (p.guest_name + p.room_number + p.method + p.status).toLowerCase().includes(q);
    });
  };

  $scope.formatCurrency = function(val) { return '₹' + parseFloat(val || 0).toLocaleString('en-IN'); };
});
