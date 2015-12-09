/**
 * Created by naved on 20/11/15.
 */
var main =  angular.module('application');

main.config(function(embedlyServiceProvider){
  embedlyServiceProvider.setKey('bc34c986d3d840bab4ff12f0a26e5f20');
});

main.controller('LoginController',['$rootScope','$scope','localStorageService','peer','$state',function($rootScope,$scope,localStorageService,peer,$state){
  if(typeof(peer) === "string"){
    $scope.peerId = peer;
    var thisPeer = new Peer(peer,{key:'ytgklpf684u0udi'});
    $rootScope.thisPeer = thisPeer;
  }
  else {
    $rootScope.$on('open', function (sender,peer) {
      generateQRCode(peer.id);
      $rootScope.thisPeer = peer;
    })
  }
  function generateQRCode(peerId){
    $scope.$apply(function(){
      $scope.peerId = peerId;
    });
  }
  $scope.searchInput = "";
  $scope.search = function(){
      if($scope.searchInput.trim() == ""){
        return;
      }
      $state.go('search',{'query':$scope.searchInput});
  }

  $rootScope.thisPeer.on('connection',function(conn){
    conn.on('open',function(){
      $rootScope.connected = true;
      $rootScope.dataConnection = conn;
    });
  });

  $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams){
      console.log('state change success');
    });

  $rootScope.$on('$stateChangeError',
    function(event, toState, toParams, fromState, fromParams){
      console.log('state change error');
    });

}]);

main.controller('SearchController',['$rootScope','$scope','$http','ModalFactory','embedlyService','$stateParams','$location',function($rootScope,$scope,$http,ModalFactory,embedlyService,$stateParams,$location){
  var tweets = $("#tweets");
  tweets.mousewheel(function(event){
      tweets[0].scrollLeft -= (event.deltaY * 30);
      event.preventDefault();
  });

  var modal = new ModalFactory({
    overlay: true,
    overlayClose: true,
    animationIn:"zoomIn",
    animationOut:"hingeOutFromMiddleY",
    templateUrl: '../../templates/chat-dialog.html',
    contentScope: {
      close: function() {
        $rootScope.doc = null;
        modal.deactivate();
        $timeout(function() {
          modal.destroy();
        }, 1000);
      }
    }
  });

  var loadExtraData = function(){
    var doc = $rootScope.doc;
    $rootScope.linkData = [];
    for(var url in doc.twitter_urls){
      embedlyService.extract(doc.twitter_urls[url]).then(function (result){
            var data = {};
            data.title = result.data.title;
            data.description = result.data.description
            data.url = result.data.original_url;
            if(result.data.images.length>0){
              data.image = result.data.images[0].url;
            }
            $rootScope.linkData.push(data);
            console.log("Updated link data")
          },
          function(error){
            console.log("Error in fetching extra information" + error)
          });
    }
  };

  $scope.searchInput = "";

  $scope.show = function (doc) {
    $rootScope.doc = doc;
    loadExtraData();
    modal.activate();
  };

  function updateDocumentsByFilter() {
    $scope.documents = [];
    var docs = [];
    if($scope.filteredCategories.length == 0){
      for(var doc in $scope.allDocuments){
        docs.push($scope.allDocuments[doc]);
      }
      reshapeDocs(docs);
      return;
    }
    for(var doc in $scope.allDocuments){
      for(var category in $scope.filteredCategories) {
        var a = $scope.allDocuments[doc].category;
        var b = $scope.filteredCategories[category];
        if ($scope.allDocuments[doc].category == $scope.filteredCategories[category]){
          docs.push($scope.allDocuments[doc]);
          break;
        }
      }
    }
    reshapeDocs(docs);
  }

  $scope.filter = function(id){
    if($scope.filteredCategories.indexOf(id) == -1){
      $scope.filteredCategories.push(id);
    }
    else{
      var index = $scope.filteredCategories.indexOf(id)
      $scope.filteredCategories.splice(index,1);
    }
    updateDocumentsByFilter();
  };

  $scope.documents = [];
  $scope.categories = [];
  $scope.allDocuments = [];
  $scope.filteredCategories = [];

  function constructDocuments(response) {
    var docs = response.data.response.docs;
    $scope.allDocuments = $.extend({},docs);
    reshapeDocs(docs);
  }

  function reshapeDocs(docs){
    while(docs.length){
      $scope.documents.push(docs.splice(0,3));
    }
  }

  function constructCategories(response) {
    var docs = response.data.response.docs;
    for(var doc in docs){
      if($scope.categories.indexOf(docs[doc].category)==-1){
        $scope.categories.push(docs[doc].category);
      }
    }
  }

  $scope.search = function(){
    var url;
    console.log("current location " + $location.path());
    $scope.documents = [];
    $scope.categories = [];
    if($scope.searchInput.trim() === ""){
      return;
    }
    else {
      url = "http://52.35.45.252:8983/solr/bladeTrinity/trinity?q="+$scope.searchInput +"&wt=json&qf=text_en%20text_de%20text_es%20text_hi%20twitter_hashtags%20user_name";
      $location.search({query:$scope.searchInput});
    }
    $http({
      method: 'GET',
      url: url
    }).then(function successCallback(response) {
        constructCategories(response);
        constructDocuments(response);
    }, function errorCallback(response) {
      console.log("Error querying solr" + JSON.stringify(response));
    });

  }

  if($stateParams.query){
    $scope.searchInput = $stateParams.query;
    $scope.search();
  }

}]);

main.controller('tweetModalController',['$rootScope','$scope','$http','embedlyService',function($rootScope,$scope,$http,embedlyService){


}]);


