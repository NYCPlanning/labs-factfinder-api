module.exports = [
    //   Population per acre
    {
        variable: 'popacre',
        specialType: 'mean',
        options: { args: ['pop5', 'landacres'], formulaName: { sum: 'ratio' } },
    },
    // Median Age
    {
        variable: 'mdage',
        specialType: 'median',
        options: {},
    },
    // Age dependency ratio
    {
        variable: 'agdpdrt',
        specialType: 'mean',
        options: { args: ['agu1865p', 'ag18t64'], formulaName: { sum: 'ratio' } }
    },
    // Old age dependency ratio
    {
        variable: 'odagdpdrt',
        specialType: 'mean',
        options: { args: ['odag65pl', 'odag18t64'], formulaName: { sum: 'ratio' } }
    },
    // Child dependency ratio
    {
        variable: 'chlddpdrt',
        specialType: 'mean',
        options: { args: ['cdpdu18', 'cdpd18t64'], formulaName: { sum: 'ratio' } }
    },
    // Home owner vacancy rate
    {
        variable: 'hmownvcrt',
        specialType: 'mean',
        options: { args: ['vacsale', 'hovacu'], formulaName: { sum: 'ratio' } },
    },
    // Rental vacancy rate
    {
        variable: 'rntvcrt',
        specialType: 'mean',
        options: { args: ['vacrnt', 'rntvacu'], formulaName: { sum: 'ratio' } },
    },
    // Average household size
    {
        variable: 'avghhsz',
        specialType: 'mean',
        options: { args: ['popinhh_1', 'ochu_1'] },
    }
];
