/**
 * Created by naved on 20/11/15.
 */
var main =  angular.module('application');

main.factory('peer',function(localStorageService,$rootScope){
  var peerId = localStorageService.get('peerId');
  if(!peerId){
    var peer = new Peer({key:'ytgklpf684u0udi'});
    peer.on('open',function(id){
      peerId = id;
      localStorageService.set('peerId',peerId);
      $rootScope.$emit('open',peer);
    });
    return peerId;
  }
  else{
    return peerId;
  }
});


//Bhavika.. i have added the service.. modify this as apprporiately
main.factory('wikiService', function($http) {

  var wikiService = {
    get: function(country) {
      return $http.jsonp('http://es.wikipedia.org/w/api.php?titles=' + country.name.toLowerCase() + '&rawcontinue=true&action=query&format=json&prop=extracts&callback=JSON_CALLBACK');
    }
  };

  return wikiService;
});
