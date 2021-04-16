exports.userQueries = {
    user: (root, args, context) => {
        return context.models.UserModel.getAuthUser(context);
    },
    getUserFollowing: async (root, args, context) => {
        return await context.models.UserFollowingModel.getUserFollowingList();
    }
}


exports.userMutations = {
    signIn: (root, { input }, context) => {
        return context.models.UserModel.signIn(input, context);
    },
    signUp: async (root, { input }, context) => {
        const createdUser = await context.models.UserModel.signUp(input);
        return createdUser._id;
    },
    signOut: (root, args, context) => {
        return context.models.UserModel.signOut(context);
    }
}
