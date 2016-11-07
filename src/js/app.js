'use strict';

require('../../node_modules/jquery/dist/jquery.min.js');
require('../../lib/owl.carousel/owl-carousel/owl.carousel.js');
require('../../node_modules/bootstrap/dist/js/bootstrap.min.js');
require('../../node_modules/angular/angular.js');
require('../../node_modules/angular-route/angular-route.js');

var options = {
    items: 3,
    margin: 20,
    autoHeight : true,
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
    $rootScope.isProductsLoaded = false;
    $rootScope.basket = angular.fromJson(localStorage.getItem("basket")) || [];

    $rootScope.$watch('basket', function (newValue, oldValue, scope) {
        console.log('update basket');
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

    $rootScope.productById = function (id) {
        if (!$rootScope.products) {
            return false;
        }

        return $rootScope.findInById($rootScope.products, id);
    };

    $rootScope.findInById = function (storage, id) {
        return $filter('filter')(storage, {id: id})[0];
    };

    $rootScope.setOrderBy = function (expression) {
        $rootScope.sortOrder = expression;
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
        let products = response.data.products;

        //let basket = angular.fromJson(localStorage.getItem("basket")) || [];
        angular.forEach(products, function (product, key) {
            let hasItem = $rootScope.findInById($rootScope.basket, product.id);
            //let hasItem = $rootScope.findInById(basket, product.id);
            if (hasItem) {
                product.quantity -= hasItem.quantity;
            }
        });

        $rootScope.products = products;
        $rootScope.isProductsLoaded = true;
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

app.controller('categories', function ($rootScope, $routeParams) {
    initCarousel();
    $rootScope.category_id = $routeParams.id;
});

app.controller('basket', function ($location, $anchorScroll) {
    $scope.scrollTo = function(id) {
        $location.hash(id);
        $anchorScroll();
    };
});

app.controller('products', function ($scope) {
    $scope.quantity = 1;

    $scope.$watch('product', function (newValue, oldValue, scope) {
        $scope.quantity = !newValue.quantity ? 0 : 1;
    }, true);

    $scope.$watch('quantity', function (newValue, oldValue, scope) {
        if($scope.quantity > $scope.product.quantity) {
            $scope.quantity = $scope.product.quantity;
        }

        if($scope.quantity <= 0 && $scope.product.quantity) {
            $scope.quantity = 1;
        }
    }, true);

    $scope.increaseQuantity = function (product) {
        product.quantity >= $scope.quantity + 1 && $scope.quantity++;
    };

    $scope.decreaseQuantity = function (product) {
        ($scope.quantity - 1) > 0 && $scope.quantity--;
    };
});

app.controller('galleries', function ($scope) {
    $scope.imgIndex = 0;
    $scope.setCoverImage = function (index) {
        $scope.imgIndex = index;
    };
});

app.directive('imageonload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                console.log('image is loaded');
                initCarousel();
            });
            element.bind('error', function(){
                console.log('image could not be loaded');
            });
        }
    };
});