'use strict';

require('../../node_modules/angular/angular.js');
require('../../node_modules/angular-route/angular-route.js');

var app = angular.module('spa-basket', ["ngRoute"]);

app.run(function ($rootScope, $filter, $http) {
    $rootScope.basket = JSON.parse(localStorage.getItem("basket")) || [];

    $rootScope.addItem = function (id) {
        $rootScope.basket.push(id);
        localStorage.setItem("basket", JSON.stringify($rootScope.basket));
    };

    $rootScope.removeItem = function (index) {
        $rootScope.basket.splice(index, 1);
        localStorage.setItem("basket", JSON.stringify($rootScope.basket));
    };

    $rootScope.getTotal = function () {
        var total = 0;

        if(!$rootScope.products) {
            return 'products not ready';
        }

        for (var i = 0; i < $rootScope.basket.length; i++) {
            var product_id = $rootScope.basket[i];
            var product = $filter('filter')($rootScope.products, {id: product_id})[0];
            total += product.price;
        }

        return total;
    };

    $rootScope.setOrderBy = function(expression) {
        console.log(expression);
        $rootScope.sortOrder = expression;
    }

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
