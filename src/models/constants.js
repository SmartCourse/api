const { TYPES } = require('tedious')

// Current Environment
exports.PRODUCTION = process.env.NODE_ENV === 'production'
exports.TESTING = process.env.NODE_ENV === 'test'
exports.STAGING = process.env.NODE_ENV === 'staging'

// User Constants
exports.ANONYMOUS = 0
exports.ADMIN_USERS = [
    { name: 'Nuno', email: process.env.SUPERUSER_NUNO_EMAIL, degree: 'B. Computer Science', uid: process.env.SUPERUSER_NUNO_UID },
    { name: 'Alex', email: process.env.SUPERUSER_ALEX_EMAIL, degree: 'B. Computer Science', uid: process.env.SUPERUSER_ALEX_UID },
    { name: 'Papa', email: process.env.SUPERUSER_PAPA_EMAIL, degree: 'B. Computer Science', uid: process.env.SUPERUSER_PAPA_UID }
]

// Review Constants
exports.DONT_RECOMMEND = 0
exports.RECOMMEND = 1
exports.MIN_ENJOY = 1
exports.MAX_ENJOY = 5
exports.MIN_OPTION = 0
exports.MAX_OPTION = 3

// Permissions Constants (TODO:this properly, more granularity etc)
exports.PERMISSIONS_ANON = 0 // not logged in; read only
exports.PERMISSIONS_USER = 1 // regular user; read & write everywhere, delete & edit everything they own
exports.PERMISSIONS_MOD = 2 // moderator; read, write, delete, edit everything
exports.PERMISSIONS_ADMIN = 3 // admin; everything - TODO: delete/ban users/ip addresses/etc?

// Paging Constants
exports.PAGE_SIZE = 10

// Table Names
exports.TABLE_NAMES = {
    LIKES: 'likes',
    COMMENTS: 'comments',
    REVIEWS: 'reviews',
    QUESTIONS: 'questions',
    COURSES: 'courses',
    SUBJECTS: 'subjects',
    UNIVERSITY: 'university',
    USERS: 'users',
    DEGREES: 'degrees',
    FACULTIES: 'faculties',
    SESSIONS: 'sessions',
    REPORTS: 'reports'
}

// Table Columns
exports.TABLE_COLUMNS = {
    [exports.TABLE_NAMES.UNIVERSITY]: {
        id: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        name: {
            type: TYPES.VarChar,
            options: { nullable: false }
        }
    },
    [exports.TABLE_NAMES.FACULTIES]: {
        id: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        name: {
            type: TYPES.VarChar,
            options: { nullable: false }
        }
    },
    [exports.TABLE_NAMES.SESSIONS]: {
        id: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        shortName: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        longName: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        year: {
            type: TYPES.Int,
            options: { nullable: false }
        }
    },
    [exports.TABLE_NAMES.DEGREES]: {
        id: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        name: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        longName: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        type: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        tags: {
            type: TYPES.VarChar,
            options: { nullable: true }
        },
        facultyID: {
            type: TYPES.Int,
            options: { nullable: false }
        }
    },
    [exports.TABLE_NAMES.SUBJECTS]: {
        id: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        code: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        name: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        handbookURL: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        universityID: {
            type: TYPES.Int,
            options: { nullable: false }
        }
    },
    [exports.TABLE_NAMES.COURSES]: {
        id: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        code: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        universityID: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        name: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        studyLevel: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        subjectID: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        handbookURL: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        outlineURL: {
            type: TYPES.VarChar,
            options: { nullable: true }
        },
        description: {
            type: TYPES.VarChar,
            options: { nullable: true }
        },
        requirements: {
            type: TYPES.VarChar,
            options: { nullable: true }
        },
        recommend: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        enjoy: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        difficulty: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        teaching: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        workload: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        tags: {
            type: TYPES.VarChar,
            options: { nullable: true }
        }
    },
    [exports.TABLE_NAMES.QUESTIONS]: {
        id: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        courseID: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        userID: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        title: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        body: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        pinned: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        timestamp: {
            type: TYPES.DateTime2,
            options: { nullable: false }
        }
    },
    [exports.TABLE_NAMES.REVIEWS]: {
        id: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        courseID: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        session: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        userID: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        title: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        body: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        recommend: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        enjoy: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        difficulty: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        teaching: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        workload: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        timestamp: {
            type: TYPES.DateTime2,
            options: { nullable: false }
        }
    },
    [exports.TABLE_NAMES.COMMENTS]: {
        id: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        questionID: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        reviewID: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        commentParent: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        userID: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        body: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        timestamp: {
            type: TYPES.DateTime2,
            options: { nullable: false }
        }
    },
    [exports.TABLE_NAMES.LIKES]: {
        objectType: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        objectID: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        userID: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        value: {
            type: TYPES.Int,
            options: { nullable: true }
        }
    },
    [exports.TABLE_NAMES.USERS]: {
        id: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        uid: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        displayName: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        email: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        joined: {
            type: TYPES.DateTime2,
            options: { nullable: false }
        },
        reputation: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        degreeID: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        gradYear: {
            type: TYPES.VarChar,
            options: { nullable: true }
        },
        description: {
            type: TYPES.VarChar,
            options: { nullable: true }
        },
        picture: {
            type: TYPES.VarChar,
            options: { nullable: true }
        },
        permissions: {
            type: TYPES.Int,
            options: { nullable: false }
        }
    },
    [exports.TABLE_NAMES.REPORTS]: {
        id: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        courseID: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        questionID: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        reviewID: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        commentID: {
            type: TYPES.Int,
            options: { nullable: true }
        },
        userID: {
            type: TYPES.Int,
            options: { nullable: false }
        },
        reason: {
            type: TYPES.VarChar,
            options: { nullable: false }
        },
        reviewed: {
            type: TYPES.Bit,
            options: { nullable: false }
        },
        timestamp: {
            type: TYPES.DateTime2,
            options: { nullable: false }
        }
    }
}
