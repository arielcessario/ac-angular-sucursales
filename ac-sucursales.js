(function () {
    'use strict';

    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('acSucursales', [])
        .factory('SucursalService', SucursalService)
        .service('SucursalVars', SucursalVars)
    ;


    SucursalService.$inject = ['$http', 'SucursalVars', '$cacheFactory', 'AcUtils'];
    function SucursalService($http, SucursalVars, $cacheFactory, AcUtils) {
        //Variables
        var service = {};

        var url = currentScriptPath.replace('ac-sucursales.js', '/includes/ac-sucursales.php');

        //Function declarations
        service.get = get;
        service.getByParams = getByParams;

        service.create = create;

        service.update = update;

        service.remove = remove;


        service.goToPagina = goToPagina;
        service.next = next;
        service.prev = prev;

        return service;

        //Functions
        /**
         * @description Obtiene todas las sucursales
         * @param callback
         * @returns {*}
         */
        function get(callback) {
            var urlGet = url + '?function=getSucursales';
            var $httpDefaultCache = $cacheFactory.get('$http');
            var cachedData = [];

            // Verifica si existe el cache de categorias
            if ($httpDefaultCache.get(urlGet) != undefined) {
                if (SucursalVars.clearCache) {
                    $httpDefaultCache.remove(urlGet);
                }
                else {
                    cachedData = $httpDefaultCache.get(urlGet);
                    callback(cachedData);
                    return;
                }
            }

            return $http.get(urlGet, {cache: true})
                .success(function (data) {
                    $httpDefaultCache.put(urlGet, data);
                    SucursalVars.clearCache = false;
                    SucursalVars.paginas = (data.length % SucursalVars.paginacion == 0) ? parseInt(data.length / SucursalVars.paginacion) : parseInt(data.length / SucursalVars.paginacion) + 1;
                    callback(data);
                })
                .error(function (data) {
                    callback(data);
                    SucursalVars.clearCache = false;
                })
        }

        /**
         * @description Retorna la lista filtrada de sucursales
         * @param param -> String, separado por comas (,) que contiene la lista de parámetros de búsqueda, por ej: nombre, sku
         * @param value
         * @param callback
         */
        function getByParams(params, values, exact_match, callback) {
            get(function (data) {
                AcUtils.getByParams(params, values, exact_match, data, callback);
            })
        }


        /** @name: remove
         * @param sucursal_id
         * @param callback
         * @description: Elimina la sucursal seleccionada.
         */
        function remove(sucursal_id, callback) {
            return $http.post(url,
                {function: 'removeSucursal', 'sucursal_id': sucursal_id})
                .success(function (data) {
                    if (data !== 'false') {
                        SucursalVars.clearCache = true;
                        callback(data);
                    }
                })
                .error(function (data) {
                    callback(data);
                })
        }

        /**
         * @description: Crea una sucursal.
         * @param sucursal
         * @param callback
         * @returns {*}
         */
        function create(sucursal, callback) {
            return $http.post(url,
                {
                    'function': 'createSucursal',
                    'sucursal': JSON.stringify(sucursal)
                })
                .success(function (data) {
                    SucursalVars.clearCache = true;
                    callback(data);
                })
                .error(function (data) {
                    SucursalVars.clearCache = true;
                    callback(data);
                });
        }


        /** @name: update
         * @param sucursal
         * @param callback
         * @description: Realiza update de una sucursal.
         */
        function update(sucursal, callback) {
            return $http.post(url,
                {
                    'function': 'updateSucursal',
                    'sucursal': JSON.stringify(sucursal)
                })
                .success(function (data) {
                    SucursalVars.clearCache = true;
                    callback(data);
                })
                .error(function (data) {
                    callback(data);
                });
        }

        /**
         * Para el uso de la páginación, definir en el controlador las siguientes variables:
         *
         vm.start = 0;
         vm.pagina = CategoryVars.pagina;
         CategoryVars.paginacion = 5; Cantidad de registros por página
         vm.end = CategoryVars.paginacion;


         En el HTML, en el ng-repeat agregar el siguiente filtro: limitTo:appCtrl.end:appCtrl.start;

         Agregar un botón de next:
         <button ng-click="appCtrl.next()">next</button>

         Agregar un botón de prev:
         <button ng-click="appCtrl.prev()">prev</button>

         Agregar un input para la página:
         <input type="text" ng-keyup="appCtrl.goToPagina()" ng-model="appCtrl.pagina">

         */


        /**
         * @description: Ir a página
         * @param pagina
         * @returns {*}
         * uso: agregar un método
         vm.goToPagina = function () {
                vm.start= SucursalService.goToPagina(vm.pagina).start;
            };
         */
        function goToPagina(pagina) {

            if (isNaN(pagina) || pagina < 1) {
                SucursalVars.pagina = 1;
                return SucursalVars;
            }

            if (pagina > SucursalVars.paginas) {
                SucursalVars.pagina = SucursalVars.paginas;
                return SucursalVars;
            }

            SucursalVars.pagina = pagina - 1;
            SucursalVars.start = SucursalVars.pagina * SucursalVars.paginacion;
            return SucursalVars;

        }

        /**
         * @name next
         * @description Ir a próxima página
         * @returns {*}
         * uso agregar un metodo
         vm.next = function () {
                vm.start = SucursalService.next().start;
                vm.pagina = SucursalVars.pagina;
            };
         */
        function next() {

            if (SucursalVars.pagina + 1 > SucursalVars.paginas) {
                return SucursalVars;
            }
            SucursalVars.start = (SucursalVars.pagina * SucursalVars.paginacion);
            SucursalVars.pagina = SucursalVars.pagina + 1;
            //CategoryVars.end = CategoryVars.start + CategoryVars.paginacion;
            return SucursalVars;
        }

        /**
         * @name previous
         * @description Ir a página anterior
         * @returns {*}
         * uso, agregar un método
         vm.prev = function () {
                vm.start= SucursalService.prev().start;
                vm.pagina = SucursalVars.pagina;
            };
         */
        function prev() {


            if (SucursalVars.pagina - 2 < 0) {
                return SucursalVars;
            }

            //CategoryVars.end = CategoryVars.start;
            SucursalVars.start = (SucursalVars.pagina - 2 ) * SucursalVars.paginacion;
            SucursalVars.pagina = SucursalVars.pagina - 1;
            return SucursalVars;
        }


    }

    SucursalVars.$inject = [];
    /**
     * @description Almacena variables temporales de sucursales
     * @constructor
     */
    function SucursalVars() {
        // Cantidad de páginas total del recordset
        this.paginas = 1;
        // Página seleccionada
        this.pagina = 1;
        // Cantidad de registros por página
        this.paginacion = 10;
        // Registro inicial, no es página, es el registro
        this.start = 0;


        // Indica si se debe limpiar el caché la próxima vez que se solicite un get
        this.clearCache = true;

    }




})();