import { useState, useRef, useEffect } from 'react';
import BaseLayout from '../../../layouts/BaseLayout';
import { useRouter } from 'next/router';
import { useGetTopicBySlug, useGetPostByTopic, useGetUser } from '../../../apollo/actions';
import withApollo from '../../../hoc/withApollo';
import { getDataFromTree } from '@apollo/client/react/ssr';
import PostList from '../../../Components/Post/PostList';
import ReplyBox from '../../../Components/ReplyBox';
import { useCreatePost } from '../../../apollo/actions';
import CircularLoading from '../../../Components/CircularLoading';

const useInitialData = (postSlug) => {

    // Queries
    const { data: topic, error: topicError } = useGetTopicBySlug(postSlug);
    const { data: post, error: postError, fetchMore } = useGetPostByTopic(postSlug, { pageNumber: 0, pageSize: 5 });
    const { data: user } = useGetUser();

    const topicData = (topic && topic.topicBySlug) || {};
    const postData = (post && post.postByTopic) || {};
    const userData = (user && user.user) || null;

    // Mutations

    const [createPost, { loading: createPostLoading }] = useCreatePost();

    return { topicData, postData, createPostLoading, topicError, postError, userData, createPost, fetchMore };
}


function PostPage() {

    // Router
    const router = useRouter();
    const { postSlug } = router.query;

    // Refs
    const pageEnd = useRef();
    const disposeId = useRef(null);

    const { topicData, postData, userData, createPostLoading, topicError, postError, createPost, fetchMore } = useInitialData(postSlug);

    const [showReplyPanel, setShowReplyPanel] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [pagination, setPagination] = useState({ pageNumber: 5, pageSize: 5 });
    const [dataLoading, setDataLoading] = useState(false);
    const [replyError, setReplyError] = useState(null);

    useEffect(() => {
        let updatePagination = JSON.parse(JSON.stringify(pagination));
        updatePagination.pageNumber = postData.posts && postData.posts.length;
        setPagination(updatePagination);
    }, [postData.posts])

    useEffect(() => {
        if (replyError) {
            disposeId.current = setTimeout(() => {
                setReplyError(null);
            }, 3000)
        }
        return (() => {
            clearTimeout(disposeId.current);
        })
    }, [replyError])


    const scrollToBottom = () => {
        pageEnd.current.scrollIntoView({ behavior: 'smooth' });
    }

    const cleanUp = () => {
        setShowReplyPanel(false);
        scrollToBottom();
    }

    const loadMoreData = async (pagination) => {
        setDataLoading(true);
        try {
            await fetchMore({
                variables: { slug: postSlug, pageSize: pagination.pageSize, pageNumber: postData.posts.length },
                updateQuery: (previousResult, { fetchMoreResult }) => {
                    if (!fetchMoreResult) return previousResult;
                    return {
                        postByTopic: {
                            ...fetchMoreResult.postByTopic,
                            posts: [
                                ...previousResult.postByTopic.posts,
                                ...fetchMoreResult.postByTopic.posts,
                            ],
                        },
                    }
                }
            })
            setDataLoading(false);
        }
        catch (err) {
            console.log(err);
            setDataLoading(false);
        }
    }

    const handleReplyFormSubmit = async (e, formField, resetFormField) => {
        e.preventDefault();
        try {
            if (replyTo) {
                formField.parent = replyTo._id;
            }
            formField.topic = topicData._id;
            await createPost({ variables: formField });

            // updateQuery will have two parameter one is prevData, updatedData
            // Eg. in prevData 10 array list we are creting new post now updatedData will have 11 array list 

            let lastPage = Math.ceil(postData.count / pagination.pageSize);
            if (postData.count === 0) lastPage = 1;
            lastPage * pagination.pageSize >= pagination.pageNumber && await fetchMore({
                variables: { slug: postSlug, pageSize: pagination.pageSize, pageNumber: postData.posts.length },
                updateQuery: (previousResult, { fetchMoreResult }) => {
                    return {
                        postByTopic: {
                            ...fetchMoreResult.postByTopic,
                            posts: [
                                ...previousResult.postByTopic.posts,
                                ...fetchMoreResult.postByTopic.posts
                            ]
                        }
                    }
                }
            })
            resetFormField();
            cleanUp();
        }
        catch (err) {
            const pareseError = JSON.parse(JSON.stringify(err));
            if (pareseError.message.includes('Please Enter')) setReplyError(pareseError.message);
            if (!formField.content) setReplyError('Please Enter Content');
            if (pareseError.message.includes('Something')) setReplyError(pareseError.message);
        }
    }

    return (
        <>
            <div className="topic_post_main_container">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="topic_post_heading">{topicData.title}</div>
                        </div>
                    </div>
                    <PostList
                        // currentPage={pagination.pageNumber}
                        topicError={topicError}
                        postError={postError}
                        canCreate={userData ? true : false}
                        topicData={topicData}
                        postData={postData.posts ? postData.posts : []}
                        onReplyOpen={(replyToInfo) => {
                            setShowReplyPanel(true),
                                setReplyTo(replyToInfo)
                        }}
                    />
                </div>
            </div>
            <div className="topic_post_bottom_container">
                <div className="container-fluid">
                    {/* {
                        Math.ceil(postData.count / pagination.pageSize) * pagination.pageSize >= pagination.pageNumber &&
                        <div className="row">
                            <div className="col-md-4 mx-auto">
                                <button onClick={() => loadMoreData(pagination)}>Show more</button>
                            </div>
                        </div>
                    } */}
                    <div className="row">
                        {
                            postData.count > pagination.pageNumber &&
                            <div className="col-md-10 mx-auto">
                                {
                                    dataLoading ? <CircularLoading />
                                        : <button className="topic_post_show_more_btn" onClick={() => loadMoreData(pagination)}>Show more</button>
                                }
                            </div>
                        }

                    </div>

                    <div className="row">
                        <div className="col-md-10 mx-auto">
                            {/* <div className="row">
                                <div className="col-md-6"> */}
                            {
                                userData && userData.username && postData.count <= pagination.pageNumber &&
                                <button className="topic_post_bottom_btn"
                                    onClick={() => {
                                        setReplyTo(null),
                                            setShowReplyPanel(true)
                                    }}
                                >
                                    Add Comments
                                </button>
                            }

                            {/* </div> */}
                            {/* <div className="col-md-6">
                                    <div className="topic_post_pagination"> */}
                            {/* <AppPagination
                                            count={count}
                                            pageNumber={pagination.pageNumber}
                                            pageSize={pagination.pageSize}
                                            onPageChange={(pageNumber, pageSize) => {
                                                router.push('/forum/Post/[postSlug]', `/forum/Post/${postSlug}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { shallow: true })
                                                setPagination({ pageNumber, pageSize });
                                                scrollToTopPage();
                                            }}
                                        /> */}
                            {/* </div> */}
                            {/* </div> */}
                            {/* </div> */}
                        </div>
                    </div>
                </div>
            </div>
            <div ref={pageEnd}></div>
            <div className={`reply_box_container ${showReplyPanel ? 'show' : ''}`}>
                <ReplyBox
                    btnDisplayContent="Comment"
                    loading={createPostLoading}
                    hasTitle={false}
                    replyError={replyError}
                    replyTo={(replyTo && replyTo.user.username) || topicData.title}
                    handleReplyFormSubmit={handleReplyFormSubmit}
                    onClose={() => setShowReplyPanel(false)}
                />
            </div>
            {showReplyPanel && <div className="header_page_mobile_overlay" onClick={() => setShowReplyPanel(false)}></div>}
        </>
    )
}

export default withApollo(PostPage, { getDataFromTree });