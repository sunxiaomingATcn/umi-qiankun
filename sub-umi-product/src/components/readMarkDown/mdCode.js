/**
 * 读取markdown文件
 * Class Markdown 文件放在 @/assets/md/路径下 后缀.md, 只用于各种文字协议，没有使用语法高亮模块
 * @param mdName markdown文件名 required
 * */

import React, {Component} from 'react';
import showdown from 'showdown';
import styles from './index.less'

class Markdown extends Component {

    state = {
        markdown: '',
    };

    componentDidMount() {
        const {mdName} = this.props;
        if (!mdName) return;
        const AppMarkdown = require(`@/assets/md/${mdName}.md`)
        fetch(AppMarkdown)
            .then(res => res.text())
            .then(text => {
                const convert = new showdown.Converter({tables: true})
                const markdown = convert.makeHtml(text)
                this.setState({markdown})
            });
    }

    render() {
        const {markdown} = this.state;

        return (
            <div className={styles.markDown} dangerouslySetInnerHTML={{__html: markdown}} ></div>
        );
    }
}

export default Markdown;
