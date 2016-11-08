'use strict';

require('../../node_modules/jquery/dist/jquery.min.js');
require('../../lib/owl.carousel/owl-carousel/owl.carousel.js');
require('../../node_modules/bootstrap/dist/js/bootstrap.min.js');
require('../../node_modules/angular/angular.js');
require('../../node_modules/angular-route/angular-route.js');

var options = {
    items: 3,
    margin: 20,
    autoHeight: true,
    stagePadding: 50,
    navigation: true,
    navigationText: [
        "<span class='glyphicon glyphicon-menu-left'></span>",
        "<span class='glyphicon glyphicon-menu-right'></span>"
    ],
    pagination: false
};

$(document).ready(function () {
    initCarousel();
    $('#page-loader').hide();
});

function initCarousel() {
    var owl = $(".owl-carousel");
    owl.owlCarousel(options);
}

var app = angular.module('spa-basket', ["ngRoute"]);

app.run(function ($rootScope, $filter, $http) {
    $http.get("data/galleries.json").then(function (response) {
        $rootScope.galleries = response.data.galleries;
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
        .when("/basket", {
            controller: "basket"
        })
        .otherwise({redirectTo: '/'});
});

app.controller('categories', function ($rootScope, $routeParams, $http) {
    $http.get("data/categories.json").then(function (response) {
        $rootScope.categories = response.data.categories;
    });

    $rootScope.setOrderBy = function (expression) {
        $rootScope.sortOrder = expression;
    };

    $rootScope.isCategoryActive = function (category_id) {
        return category_id === $rootScope.category_id;
    };


    initCarousel();
    $rootScope.category_id = $routeParams.id;
});

app.controller('basket', function ($rootScope, $scope, $location, $anchorScroll) {
    $rootScope.basket = angular.fromJson(localStorage.getItem("basket")) || [];

    angular.forEach($rootScope.products, function (product, key) {
        let hasItem = $rootScope.findInById($rootScope.basket, product.id);
        if (hasItem) {
            product.quantity -= hasItem.quantity;
        }
    });

    $rootScope.$watch('basket', function (newValue, oldValue, scope) {
        localStorage.setItem("basket", angular.toJson($rootScope.basket));
    }, true);

    $rootScope.addItem = function (id, quantity) {
        quantity = typeof quantity !== 'undefined' ? parseInt(quantity) : 1;
        let basket = $rootScope.basket;
        let hasItem = $rootScope.findInById(basket, id);
        let product = $rootScope.productById(id);

        if (!quantity) {
            console.log(`wrong quantity amount ${quantity}`);
            return false;
        }

        if (product.quantity < quantity) {
            console.log(`selected quantity ${quantity} exceeds the available ${product.quantity}`);
            return false;
        }

        if (hasItem) {
            let index = basket.indexOf(hasItem);
            basket[index].quantity += quantity;
        } else {
            basket.push({
                id: product.id,
                quantity: quantity
            });
        }

        product.quantity -= quantity;
        product.buyQuantity = product.buyQuantity > product.quantity ? product.quantity : product.buyQuantity;
        localStorage.setItem("basket", angular.toJson(basket));
    };

    $rootScope.removeItem = function (id) {
        let basket = $rootScope.basket;
        let hasItem = $rootScope.findInById(basket, id);
        let product = $rootScope.productById(id);

        if (!hasItem) {
            return false;
        }

        let index = basket.indexOf(hasItem);

        if (hasItem.quantity > 1) {
            basket[index].quantity--;
        } else {
            basket.splice(index, 1);
        }

        product.quantity++;
        product.buyQuantity = product.buyQuantity < 1 ? 1 : 1;
        localStorage.setItem("basket", angular.toJson(basket));
    };

    $rootScope.getTotal = function () {
        var total = 0;

        angular.forEach($rootScope.basket, function (item, key) {
            let product = $rootScope.productById(item.id);
            total += product.price * item.quantity;
        });

        return total;
    };

    $scope.scrollTo = function (id) {
        $location.hash(id);
        $anchorScroll();
    };
});

app.controller('products', function ($rootScope, $scope, $http, $filter) {
    $http.get("data/products.json").then(function (response) {
        let products = response.data.products;
        $rootScope.products = products;
    });

    $rootScope.productById = function (id) {
        if (!$rootScope.products) {
            return false;
        }

        return $rootScope.findInById($rootScope.products, id);
    };

    $rootScope.findInById = function (storage, id) {
        return $filter('filter')(storage, {id: id})[0];
    };

    $scope.getDefaultBuyQuantity = function (product) {
        return product.quantity ? 1 : 0;
    };

    $scope.changeBuyQuantity = function (product) {
        if (product.buyQuantity > product.quantity) {
            product.buyQuantity = product.quantity;
        }

        if (product.buyQuantity < 1 && product.quantity) {
            product.buyQuantity = 1;
        }
    };

    $scope.increaseBuyQuantity = function (product) {
        if (product.quantity > product.buyQuantity) {
            product.buyQuantity++;
        }
    };

    $scope.decreaseBuyQuantity = function (product) {
        if (product.buyQuantity > 1) {
            product.buyQuantity--;
        }
    };
});

app.controller('galleries', function ($scope) {
    $scope.imgIndex = 0;
    $scope.setCoverImage = function (index) {
        $scope.imgIndex = index;
    };
});

app.directive('imageonload', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('load', function () {
                //console.log('image is loaded');
                initCarousel();
            });
            element.bind('error', function () {
                console.log('image could not be loaded');
            });
        }
    };
});