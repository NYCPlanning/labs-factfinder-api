module.exports = [
  {
    title: 'Civilian noninstitutionalized population',
    highlight: true,
    variable: 'cvnipop2',
  },
  {
    title: 'With health insurance coverage',
    variable: 'hins',
  },
  {
    indent: 1,
    title: 'With private health insurance',
    variable: 'pvhins',
  },
  {
    indent: 1,
    title: 'With public coverage',
    variable: 'pbhins',
  },
  {
    title: 'No health insurance coverage',
    variable: 'nhins',
  },
  {
    divider: true,
  },
  {
    title: 'Civilian noninstitutionalized population under 18 years',
    highlight: true,
    variable: 'cvniu18_2',
  },
  {
    title: 'No health insurance coverage',
    variable: 'u18nhins',
  },
  {
    divider: true,
  },
  {
    title: 'Civilian noninstitutionalized population 18 to 64 years',
    variable: 'cni1864_2',
    special: true,
  },
  {
    indent: 1,
    title: 'In labor force',
    variable: 'cvlf18t64',
    special: true,
  },
  {
    indent: 3,
    title: 'Employed',
    highlight: true,
    variable: 'cvlfem',
  },
  {
    indent: 3,
    title: 'With health insurance coverage',
    variable: 'emhins',
  },
  {
    indent: 4,
    title: 'With private health insurance',
    variable: 'empvhins',
  },
  {
    indent: 4,
    title: 'With public coverage',
    variable: 'empbhins',
  },
  {
    indent: 3,
    title: 'No health insurance coverage',
    variable: 'emnhins',
  },
  {
    indent: 3,
    title: 'Unemployed',
    highlight: true,
    variable: 'uem',
  },
  {
    indent: 3,
    title: 'With health insurance coverage',
    variable: 'uemhins',
  },
  {
    indent: 4,
    title: 'With private health insurance',
    variable: 'uempvhins',
  },
  {
    indent: 4,
    title: 'With public coverage',
    variable: 'uempbhins',
  },
  {
    indent: 3,
    title: 'No health insurance coverage',
    variable: 'uemnhins',
  },
  {
    indent: 1,
    title: 'Not in labor force',
    highlight: true,
    variable: 'nlf2',
  },
  {
    indent: 1,
    title: 'With health insurance coverage',
    variable: 'nlfhins',
  },
  {
    indent: 2,
    title: 'With private health insurance',
    variable: 'nlfpvhins',
  },
  {
    indent: 2,
    title: 'With public coverage',
    variable: 'nlfpbhins',
  },
  {
    indent: 1,
    title: 'No health insurance coverage',
    variable: 'nlfnhins',
  },
];
