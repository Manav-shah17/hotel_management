// frontend/app.js
var app = angular.module('hotelApp', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider
    .when('/', { templateUrl: 'views/dashboard.html', controller: 'DashboardCtrl' })
    .when('/rooms', { templateUrl: 'views/rooms.html', controller: 'RoomsCtrl' })
    .when('/guests', { templateUrl: 'views/guests.html', controller: 'GuestsCtrl' })
    .when('/reservations', { templateUrl: 'views/reservations.html', controller: 'ReservationsCtrl' })
    .when('/staff', { templateUrl: 'views/staff.html', controller: 'StaffCtrl' })
    .when('/inventory', { templateUrl: 'views/inventory.html', controller: 'InventoryCtrl' })
    .when('/maintenance', { templateUrl: 'views/maintenance.html', controller: 'MaintenanceCtrl' })
    .when('/feedback', { templateUrl: 'views/feedback.html', controller: 'FeedbackCtrl' })
    .when('/payments', { templateUrl: 'views/payments.html', controller: 'PaymentsCtrl' })
    .when('/login', { templateUrl: 'views/login.html', controller: 'AuthCtrl' })
    .when('/signup', { templateUrl: 'views/signup.html', controller: 'AuthCtrl' })
    .otherwise({ redirectTo: '/login' });
});

app.run(function($rootScope, $location) {
  var publicRoutes = ['/login', '/signup'];

  $rootScope.$on('$routeChangeStart', function(event, next) {
    var token = localStorage.getItem('hotelAppToken');
    var path = $location.path();

    if (!token && publicRoutes.indexOf(path) === -1) {
      $location.path('/login');
    }

    if (token && path === '/login') {
      $location.path('/');
    }
  });
});

// API Base URL
app.constant('API_URL', 'http://localhost:3000/api');

// ============================================
// ROOT CONTROLLER (sidebar + topbar)
// ============================================
app.controller('AppCtrl', function($scope, $location, $rootScope) {
  $rootScope.isAuthenticated = !!localStorage.getItem('hotelAppToken');
  $rootScope.currentUser = localStorage.getItem('hotelAppUserName') || localStorage.getItem('hotelAppUserEmail');

  $scope.navItems = [
    { label: 'Dashboard', icon: '📊', path: '/', section: 'MAIN' },
    { label: 'Rooms', icon: '🛏️', path: '/rooms', section: 'HOTEL OPS' },
    { label: 'Guests', icon: '👤', path: '/guests', section: 'HOTEL OPS' },
    { label: 'Reservations', icon: '📅', path: '/reservations', section: 'HOTEL OPS' },
    { label: 'Payments', icon: '💳', path: '/payments', section: 'HOTEL OPS' },
    { label: 'Staff', icon: '👥', path: '/staff', section: 'MANAGEMENT' },
    { label: 'Inventory', icon: '📦', path: '/inventory', section: 'MANAGEMENT' },
    { label: 'Maintenance', icon: '🔧', path: '/maintenance', section: 'MANAGEMENT' },
    { label: 'Feedback', icon: '⭐', path: '/feedback', section: 'MANAGEMENT' }
  ];

  $scope.sections = ['MAIN', 'HOTEL OPS', 'MANAGEMENT'];

  $scope.logout = function() {
    localStorage.removeItem('hotelAppToken');
    localStorage.removeItem('hotelAppUserEmail');
    localStorage.removeItem('hotelAppUserName');
    $rootScope.isAuthenticated = false;
    $rootScope.currentUser = null;
    $location.path('/login');
  };

  $scope.isActive = function(path) {
    return $location.path() === path;
  };

  $scope.navigate = function(path) {
    $location.path(path);
  };

  $scope.getPageTitle = function() {
    var path = $location.path();
    var titles = {
      '/': 'Dashboard', '/rooms': 'Room Management', '/guests': 'Guest Management',
      '/reservations': 'Reservations', '/staff': 'Staff Management',
      '/inventory': 'Inventory', '/maintenance': 'Maintenance', '/feedback': 'Feedback',
      '/payments': 'Payments'
    };
    return titles[path] || 'Hotel Management';
  };

  $scope.getPageSubtitle = function() {
    var path = $location.path();
    var subs = {
      '/': 'Overview of your hotel operations',
      '/rooms': 'Manage hotel rooms and availability',
      '/guests': 'View and manage guest profiles',
      '/reservations': 'Track bookings and reservations',
      '/staff': 'Manage hotel staff members',
      '/inventory': 'Track supplies and stock levels',
      '/maintenance': 'Handle room maintenance requests',
      '/feedback': 'Guest reviews and ratings',
      '/payments': 'Payment records and transactions'
    };
    return subs[path] || '';
  };

  $scope.today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
});
