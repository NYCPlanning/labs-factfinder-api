module.exports = [
  {
    title: 'Occupied units paying rent (excluding units where GRAPI cannot be computed)',
    highlight: true,
    variable: 'ochuprnt2',
  },
  {
    title: 'Less than 15.0 percent',
    variable: 'grpiu15',
  },
  {
    title: '15.0 to 19.9 percent',
    variable: 'grpi15t19',
  },
  {
    title: '20.0 to 24.9 percent',
    variable: 'grpi20t24',
  },
  {
    title: '25.0 to 29.9 percent',
    variable: 'grpi25t29',
  },

  {
    title: '30.0 to 34.9 percent',
    variable: 'grpi30t34',
  },
  {
    title: '35.0 percent or more',
    variable: 'grpi35pl',
  },
  {
    indent: 1,
    title: '50.0 percent or more',
    variable: 'grpi50pl',
  },
  {
    divider: true,
  },
  {
    title: 'Not computed',
    variable: 'grpintc',
  },
];
