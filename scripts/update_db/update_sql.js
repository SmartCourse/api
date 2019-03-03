const { Request } = require('tedious')
const {
    TABLE_NAMES
} = require('../../src/models/constants')

exports.update = async function (db) {
    const [connection] = db.connections

    await new Promise((resolve, reject) => {
        const request = new Request(doUpdate(), (err) => {
            if (err) {
                console.error(err)
                reject(err)
            } else resolve()
        })
        connection.execSql(request)
    })
}

// March 1 2019 bugfix - update DEFAULT value of datetime2 columns
function doUpdate() {
    // find each default constraint on each datetime2 column and drop it
    // change type to datetime
    // add new named default constraints
    return `
    BEGIN TRANSACTION;
        DECLARE @Command NVARCHAR(1000);

        SELECT @Command = 'ALTER TABLE ${TABLE_NAMES.USERS} DROP CONSTRAINT ' + d.name
            FROM sys.tables t
                JOIN sys.default_constraints d ON d.parent_object_id = t.object_id
                JOIN sys.columns c ON c.object_id = t.object_id AND c.column_id = d.parent_column_id
            WHERE t.name = '${TABLE_NAMES.USERS}'
                AND c.name = 'joined';
        EXECUTE (@Command);
        ALTER TABLE ${TABLE_NAMES.USERS}
            ALTER COLUMN joined datetime2 NOT NULL;
        ALTER TABLE ${TABLE_NAMES.USERS} 
            ADD CONSTRAINT df_joined_user DEFAULT SYSUTCDATETIME() FOR joined;

        SELECT @Command = 'ALTER TABLE ${TABLE_NAMES.QUESTIONS} DROP CONSTRAINT ' + d.name
            FROM sys.tables t
                JOIN sys.default_constraints d ON d.parent_object_id = t.object_id
                JOIN sys.columns c ON c.object_id = t.object_id AND c.column_id = d.parent_column_id
            WHERE t.name = '${TABLE_NAMES.QUESTIONS}'
                AND c.name = 'timestamp';
        EXECUTE (@Command);
        ALTER TABLE ${TABLE_NAMES.QUESTIONS}
            ALTER COLUMN timestamp datetime2 NOT NULL;
        ALTER TABLE ${TABLE_NAMES.QUESTIONS} 
            ADD CONSTRAINT df_timestamp_question DEFAULT SYSUTCDATETIME() FOR timestamp;

        SELECT @Command = 'ALTER TABLE ${TABLE_NAMES.REVIEWS} DROP CONSTRAINT ' + d.name
            FROM sys.tables t
                JOIN sys.default_constraints d ON d.parent_object_id = t.object_id
                JOIN sys.columns c ON c.object_id = t.object_id AND c.column_id = d.parent_column_id
            WHERE t.name = '${TABLE_NAMES.REVIEWS}'
                AND c.name = 'timestamp';
        EXECUTE (@Command);
        ALTER TABLE ${TABLE_NAMES.REVIEWS}
            ALTER COLUMN timestamp datetime2 NOT NULL;
        ALTER TABLE ${TABLE_NAMES.REVIEWS} 
            ADD CONSTRAINT df_timestamp_review DEFAULT SYSUTCDATETIME() FOR timestamp;

        SELECT @Command = 'ALTER TABLE ${TABLE_NAMES.COMMENTS} DROP CONSTRAINT ' + d.name
            FROM sys.tables t
                JOIN sys.default_constraints d ON d.parent_object_id = t.object_id
                JOIN sys.columns c ON c.object_id = t.object_id AND c.column_id = d.parent_column_id
            WHERE t.name = '${TABLE_NAMES.COMMENTS}'
                AND c.name = 'timestamp';
        EXECUTE (@Command);
        ALTER TABLE ${TABLE_NAMES.COMMENTS}
            ALTER COLUMN timestamp datetime2 NOT NULL;
        ALTER TABLE ${TABLE_NAMES.COMMENTS} 
            ADD CONSTRAINT df_timestamp_comment DEFAULT SYSUTCDATETIME() FOR timestamp;

        SELECT @Command = 'ALTER TABLE ${TABLE_NAMES.REPORTS} DROP CONSTRAINT ' + d.name
            FROM sys.tables t
                JOIN sys.default_constraints d ON d.parent_object_id = t.object_id
                JOIN sys.columns c ON c.object_id = t.object_id AND c.column_id = d.parent_column_id
            WHERE t.name = '${TABLE_NAMES.REPORTS}'
                AND c.name = 'timestamp';
        EXECUTE (@Command);
        ALTER TABLE ${TABLE_NAMES.REPORTS}
            ALTER COLUMN timestamp datetime2 NOT NULL;
        ALTER TABLE ${TABLE_NAMES.REPORTS} 
            ADD CONSTRAINT df_timestamp_report DEFAULT SYSUTCDATETIME() FOR timestamp;

    COMMIT;`
}
