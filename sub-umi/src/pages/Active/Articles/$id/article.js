import React, { Component } from 'react';
import Page from './articles/page';

class Article extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderArticle = () => {
        const { articleId } = this.props;
        const articleKey = articleId.toLowerCase();
        const curComData = Page[articleKey] || {};
        const Component = curComData.component;
        if (curComData.title) document.title = curComData.title;
        return Component ? <Component /> : <p>文章id错误</p>
    }

    render() {
        return this.renderArticle()
    }
}

export default Article;