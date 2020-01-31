const {
  FDW_EDM_HOST,
  FDW_EDM_PORT,
  FDW_EDM_DBNAME,
  FDW_EDM_USERNAME,
  FDW_EDM_PASSWORD,
} = process.env;

// Creates a foreign data wrapper using the remote database credentials and sets up foreign schema in local database
exports.up = (pgm) => {
  pgm.createExtension('postgres_fdw');

  // Create the FDW server
  pgm.sql(`
    CREATE SERVER edm_data
      FOREIGN DATA WRAPPER postgres_fdw
      OPTIONS (host '{FDW_EDM_HOST}', port '{FDW_EDM_PORT}', dbname '{FDW_EDM_DBNAME}');
  `, {
    FDW_EDM_HOST,
    FDW_EDM_PORT,
    FDW_EDM_DBNAME,
  });

  // Assign remote server user permissions to current user
  pgm.sql(`
    CREATE USER MAPPING FOR CURRENT_USER
      SERVER edm_data
      OPTIONS (user '{FDW_EDM_USERNAME}', password '{FDW_EDM_PASSWORD}');
  `, {
    FDW_EDM_USERNAME,
    FDW_EDM_PASSWORD,
  });
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP USER MAPPING FOR CURRENT_USER
      SERVER edm_data
  `);

  pgm.sql(`DROP SERVER edm_data`);

  pgm.dropExtension('postgres_fdw');
};
