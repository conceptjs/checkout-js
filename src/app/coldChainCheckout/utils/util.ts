const lookup = require('country-code-lookup');
var _ = require('underscore');

const allCountries = lookup.countries;

interface MissingMaps {
  [name: string]: string
}


const missingMaps: MissingMaps = {
  "KOREA, REPUBLIC OF": "KR",
  "USA": "US"
}

export const getCountryISOCodeFromName = (countryName:string) => {
  if (!countryName) return "US";
  var hit = _.find(allCountries, function(c:any){
    return c.country.toLowerCase() == countryName.toLowerCase();
  });

  if (hit){
    return hit.iso2;
  }else{
    var missingHit = missingMaps[countryName.toUpperCase()];
    return (missingHit)?missingHit:"US";
  }
}

