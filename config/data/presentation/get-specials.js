const haveSpecial = [
require('./demographic/sex-and-age.js'),
require('./economic/income-and-benefits.js'),
require('./economic/commute-to-work.js'),
require('./economic/health-insurance-coverage.js'),
require('./economic/earnings.js'),
require('./housing/rooms.js'),
require('./housing/value.js'),
require('./housing/selected-monthly-owner-costs-as-a-percentage-of-household-income--smocapi.js'),
require('./housing/gross-rent.js'),
require('./housing/housing-occupancy.js'),
require('./housing/housing-tenure.js'),
require('./social/household-type.js'),
require('./decennial/population-density.js'),
require('./decennial/sex-and-age.js'),
require('./decennial/housing-occupancy.js'),
require('./decennial/relationship-to-head-of-household--householder.js'),
require('./decennial/housing-tenure.js'),
];


const pro = haveSpecial[1];
pro.forEach( (variable) => {
  console.log("\n\n\n\n ne\n\n\n");
  if (variable.specialCalculations) {
    variable.specialCalculations.forEach((c) => {
      console.log(c.column);
    });
    return;
  }
});
//haveSpecial.forEach((pro, idx) => {
//  const a = [];
//  pro.forEach((variable) => {
//    if(variable.specialCalculations) {
//      let columns = [];
//      variable.specialCalculations.forEach((c) => {
//        columns.push(c.column);
//      });
//      columns = columns.sort();
//      if(a.length) {
//        if (a[0].length !== columns.length ) {
//          console.log("length", a[0].length, columns.length);
//          console.log(a[0]);
//          console.log(columns);
//        }
//        else if (a[0][0] !== columns[0]) {
//          console.log('first', a[0][0], columns[0]);
//        }
//        else if ( a[0][a[0].length -1] !== columns[columns.length -1]) {
//          console.log("last", a[0][a[0].length -1], columns[columns.length -1]);
//        }
//      }
//      a.push(columns);
//    }
//  });
//});
