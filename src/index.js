;(function($$, $){ 'use strict';
  
  var bendPointUtilities = require('./bendPointUtilities');
  $.fn.cytoscapeEdgeBendEditing = require('./UIUtilities');

  
  // registers the extension on a cytoscape lib ref
  var register = function( cytoscape ){
    
    if( !cytoscape ){ return; } // can't register if cytoscape unspecified

    var options = {
      // this function specifies the poitions of bend points
      bendPositionsFunction: function(ele) {
        return ele.data('bendPointPositions');
      },
      // whether the bend editing operations are undoable (requires cytoscape-undo-redo.js)
      undoable: false,
      // the size of bend shape is obtained by multipling width of edge with this parameter
      bendShapeSizeFactor: 6,
      // whether to start the plugin in the enabled state
      enabled: true,
      // title of add bend point menu item (User may need to adjust width of menu items according to length of this option)
      addBendMenuItemTitle: "Add Bend Point",
      // title of remove bend point menu item (User may need to adjust width of menu items according to length of this option)
      removeBendMenuItemTitle: "Remove Bend Point"
    };
    
    function setOptions(from) {
      var tempOpts = {};
      for (var key in options)
        tempOpts[key] = options[key];

      for (var key in from)
        if (tempOpts.hasOwnProperty(key))
          tempOpts[key] = from[key];
      return tempOpts;
    }
    
    cytoscape( 'core', 'edgeBendEditing', function(opts){
      var cy = this;
      
      if(cy.contextMenus == null) {
        var exceptionStr = "To use cytoscape.js-edge-bend-editing extension you must include cytoscape.js-context-menus extension"
          + "\n" + "Please see 'https://github.com/iVis-at-Bilkent/cytoscape.js-context-menus'";
  
        throw exceptionStr;
      }
      
      // merge the options with default ones
      options = setOptions(opts);
      
      // define edgebendediting-hasbendpoints css class
      cy.style().selector('.edgebendediting-hasbendpoints').css({
        'curve-style': 'segments',
        'segment-distances': function (ele) {
          return bendPointUtilities.getSegmentDistancesString(ele);
        },
        'segment-weights': function (ele) {
          return bendPointUtilities.getSegmentWeightsString(ele);
        },
        'edge-distances': 'node-position'
      });
      
      // init bend positions
      bendPointUtilities.initBendPoints(options.bendPositionsFunction, cy.edges());
      
      if(options.enabled)
        $(cy.container()).cytoscapeEdgeBendEditing(options, cy);
      else
        $(cy.container()).cytoscapeEdgeBendEditing("unbind", cy);
      

      return this; // chainability
    } );
    
    /*
     * get segment points of an edge in an array A,
     * A[2 * i] is the x coordinate and A[2 * i + 1] is the y coordinate
     * of the ith bend point. (Returns undefined if the curve style is not segments)
     */
    cytoscape( 'collection', 'getSegmentPoints', function(){
      var ele = this;
      
      return bendPointUtilities.getSegmentPoints(ele);
    } );

  };

  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  }

  if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-edge-bend-editing', function(){
      return register;
    });
  }

  if( typeof cytoscape !== 'undefined' ){ // expose to global cytoscape (i.e. window.cytoscape)
    register( cytoscape );
  }

})(cytoscape, jQuery);
