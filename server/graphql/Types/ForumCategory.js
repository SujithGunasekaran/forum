exports.forumTypes = `
    type ForumCategory{
        _id : ID
        title : String
        subTitle : String
        slug : String
    }

    type Author {
        username : String
    }

    type Topics{
        _id : ID
        title : String
        slug : String
        content : String
        forumCategory : ForumCategory
        user : Author
        createdAt : String
    }

    input TopicInput {
        title : String
        content : String
        forumCategory : String
    }

    type Post {
        _id : ID
        content : String
        slug : String
        fullSlug : String
        topic : Topics
        user : Author
        parent : Post
        createdAt : String
    }

    input PostInput{
        content : String
        parent : String
        topic : String
    }
`;