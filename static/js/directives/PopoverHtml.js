kitin.directive( 'popoverHtml', [ '$compile', '$timeout', '$parse', '$window', '$tooltip', function ( $compile, $timeout, $parse, $window, $tooltip ) {
    return $tooltip( 'popoverHtml', 'popover', 'click' );
}]);