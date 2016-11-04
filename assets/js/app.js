/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	var app = angular.module('spa-basket', ["ngRoute"]);

	app.run(function ($rootScope, $http) {
	    $rootScope.basket = JSON.parse(localStorage.getItem("basket")) || [];

	    $rootScope.addItem = function (id) {
	        $rootScope.basket.push(id);
	        localStorage.setItem("basket", JSON.stringify($rootScope.basket));
	    };

	    $rootScope.removeItem = function (index) {
	        $rootScope.basket.splice(index, 1);
	        localStorage.setItem("basket", JSON.stringify($rootScope.basket));
	    };

	    $rootScope.isCategoryActive = function (category_id) {
	        return category_id === $rootScope.category_id;
	    };

	    $http.get("data/categories.json").then(function (response) {
	        $rootScope.categories = response.data.categories;
	    });

	    $http.get("data/galleries.json").then(function (response) {
	        $rootScope.galleries = response.data.galleries;
	    });

	    $http.get("data/products.json").then(function (response) {
	        $rootScope.products = response.data.products;
	    });
	});

	app.config(function ($routeProvider) {
	    $routeProvider
	        .when("/", {
	            templateUrl: "product.htm",
	            controller: "categories"
	        })
	        .when("/categories/:id", {
	            templateUrl: "product.htm",
	            controller: "categories"
	        })
	        .otherwise({redirectTo: '/'});
	});

	app.controller('categories', function ($rootScope, $routeParams) {
	    $rootScope.category_id = $routeParams.id;
	});

	angular.element(document).ready(function () {
	    angular.element('body').removeClass('hide');
	});


/***/ }
/******/ ]);