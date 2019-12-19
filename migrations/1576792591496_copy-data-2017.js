const constants = require('../special-calculations/data/constants');
const {
  CUR_YEAR,
  PREV_YEAR,
  DECENNIAL_CUR_YEAR,
  DECENNIAL_PREV_YEAR,
} = constants;

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO public.demographic
    SELECT * FROM pff_demographic."{SNAPSHOT1}" UNION ALL SELECT * FROM pff_demographic."{SNAPSHOT2}"
  `, {
    SNAPSHOT1: CUR_YEAR,
    SNAPSHOT2: PREV_YEAR,
  });

  pgm.sql(`
    INSERT INTO public.housing
    SELECT * FROM pff_housing."{SNAPSHOT1}" UNION ALL SELECT * FROM pff_housing."{SNAPSHOT2}"
  `, {
    SNAPSHOT1: CUR_YEAR,
    SNAPSHOT2: PREV_YEAR,
  });

  pgm.sql(`
    INSERT INTO public.economic
    SELECT * FROM pff_economic."{SNAPSHOT1}" UNION ALL SELECT * FROM pff_economic."{SNAPSHOT2}"
  `, {
    SNAPSHOT1: CUR_YEAR,
    SNAPSHOT2: PREV_YEAR,
  });

  pgm.sql(`
    INSERT INTO public.social
    SELECT * FROM pff_social."{SNAPSHOT1}" UNION ALL SELECT * FROM pff_social."{SNAPSHOT2}"
  `, {
    SNAPSHOT1: CUR_YEAR,
    SNAPSHOT2: PREV_YEAR,
  });
};

exports.down = (pgm) => {
  pgm.sql(`
    TRUNCATE TABLE public.demographic;
    TRUNCATE TABLE public.housing;
    TRUNCATE TABLE public.economic;
    TRUNCATE TABLE public.social;
  `);
};
