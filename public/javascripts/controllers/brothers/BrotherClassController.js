var ndapp = angular.module('ndapp');

ndapp.controller('brotherClassController', function($scope, $sce, ndService) {

  // Public /////////////////////////////////////////////////////////

  var public = $scope.viewModel = {
    classYear: brotherClassViewVars.classYear, 
    brothers: {},
    brotherNames: [],  
    currentBrotherName: undefined, 
    currentBrotherFirstName: undefined, 
    currentBrother: undefined, 
  }
  var setViewModel = function(data) {
    $scope.$apply(function() {
      public.brothers = data.brothers;
      public.brotherNames = Object.keys(public.brothers);
    });
  };

  public.setCurrentBrother = function(brother) {
    public.currentBrotherName = $sce.trustAsHtml(brother);
    public.currentBrotherFirstName = public.currentBrotherName.toString().split(" ")[0];
    public.currentBrother = public.brothers[brother];

    if (private.familyCell) {
      private.familyCell.css("background-color", "white")
                        .css("color", "#000");
    }

    private.familyCell = $("#" + public.classYear + "-" + public.currentBrother.info[0].info);
    private.familyCell.css("background-color", "#a90329")
                      .css("color", "white");

    $(".brotherClassContainer .brotherClassContent").scrollTop(0);
  }

  // Private ////////////////////////////////////////////////////////

  var private = {
    maxSizeMult: 2.2, 
    maxSize: 80, 
    currentIconSize: undefined,
    brotherIconCenters: {}, 
    familyCell: undefined, 

    brotherIconWrappers: undefined
  };
  var setPrivateVars = function() {

    private.currentIconSize = parseInt($(".brotherIconWrapper").css("height"));
  };

  var helpers = (function() {

    /**
     * Calculates the position of the center of
     * an element.
     */
    function calcCenter(elem) {
      var offset = elem.offset();
      var x = offset.left + (parseInt(elem.css("height"))/2);
      var y = offset.top + (parseInt(elem.css("height"))/2);  
      return {x: x, y: y};
    }

    function calcIconCenters() {
      var iconCenters = {};
      private.brotherIconWrappers.each(function(i) {
        var center = calcCenter($(this));
        iconCenters["#brotherIcon" + i] = center;
      });
      return iconCenters;
    }

    function setIconSize(wrapper, iconSize) {
      $(wrapper).css("height", iconSize + "px")
                .css("width", iconSize + "px");
      $(wrapper + " .brotherIcon").css("border-radius", (iconSize/2) + "px");
      private.currentIconSize = iconSize;
    }

    function setMaxIconSize (wrapper, iconSize) {
      $(wrapper).css("max-width", iconSize + "px")
                .css("max-height", iconSize + "px");
      $(wrapper + " .brotherIcon").css("border-radius", (iconSize/2) + "px");
    }
 
    function sizingJS() {
      var preIconSize = $(window).width() / public.brotherNames.length;
      var newIconSize = preIconSize - 
                        (preIconSize * private.maxSizeMult / public.brotherNames.length)
      setIconSize(".brotherIconWrapper", newIconSize);
      if (newIconSize < private.maxSize) {
        setMaxIconSize(".brotherIconWrapper", newIconSize);
      } else {
        setMaxIconSize(".brotherIconWrapper", private.maxSize);
      }

      if (!private.brotherIconWrappers) {
        private.brotherIconWrappers = $(".brotherIconWrapper");
      }
      private.currentIconSize = parseInt(private.brotherIconWrappers.css("height"));
    }

    function responsiveJS() {
      sizingJS();
      private.brotherIconCenters = calcIconCenters();
    }

    return {
      calcCenter: calcCenter, 
      calcIconCenters: calcIconCenters,
      setIconSize: setIconSize,
      setMaxIconSize: setMaxIconSize,
      sizingJS: sizingJS, 
      responsiveJS: responsiveJS
    }
  })();

  var init = (function() {
    ndService.ajax.brothersDeferred(public.classYear).done(function(brothers) {

      setPrivateVars();
      setViewModel({brothers: brothers});

      helpers.sizingJS();
      $(window).resize(function() {
        helpers.responsiveJS();
      });

      eventHandlers();
    });
  })();

  function eventHandlers() {
    function resizeIconBullet(e) {
      if (!private.brotherIconWrappers || private.brotherIconWrappers.length == 0) {
        private.brotherIconWrappers = $(".brotherIconWrapper");
      }
      private.brotherIconWrappers.each(function(i) {
        var center = private.brotherIconCenters["#brotherIcon" + i];
        var xDiff = Math.abs(center.x - e.pageX);
        var maxDiff = private.currentIconSize * 2;
        var maxSizeMultDiff = private.maxSizeMult - 1;

        var newSize;

        if (xDiff > maxDiff) {
          newSize = private.currentIconSize;
        } else {
          var multiplier = ((-maxSizeMultDiff/maxDiff)*xDiff) 
                           + private.maxSizeMult;
          newSize = private.currentIconSize * multiplier;
        }

        $(this).css("height", newSize)
               .css("width", newSize);
        $($(this).children()[0]).css("border-radius", newSize/2);
      });
    }

    $("#brotherSelector").on({
      mouseenter: function() {
        helpers.setIconSize(".brotherIconWrapper", 
                            parseInt(private.brotherIconWrappers.css("height")));
        private.brotherIconCenters = helpers.calcIconCenters();
        helpers.setMaxIconSize(".brotherIconWrapper", 
                               private.currentIconSize * private.maxSizeMult);
        $(document).on("mousemove", resizeIconBullet);
      }, 
      mouseleave: function() {
        $(document).off("mousemove", resizeIconBullet);
        private.brotherIconWrappers.animate({
          "height": private.currentIconSize, 
          "width": private.currentIconSize, 
          "border-radius": (private.currentIconSize/2) + "px"
        }, 200, function() {
          helpers.setMaxIconSize(".brotherIconWrapper", private.currentIconSize);
        });
      }
    });

    // Tooltips
    $(".classSelector .2018Link").tooltip({title: "Coming Soon...", 
                                           placement: "bottom"});
  }

});