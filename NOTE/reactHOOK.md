# React

## React.memo

**React.memo 为高阶组件**。

如果你的组件在相同 props 的情况下渲染相同的结果，那么你可以通过将其包装在 React.memo 中调用，以此通过记忆组件渲染结果的方式来提高组件的性能表现。这意味着在这种情况下，React 将跳过渲染组件的操作并直接复用最近一次渲染的结果。

**React.memo 仅检查 props 变更**。如果函数组件被 React.memo 包裹，且其实现中拥有 useState，useReducer 或 useContext 的 Hook，当 state 或 context 发生变化时，它仍会重新渲染。

**默认情况下其只会对复杂对象做浅层对比**，如果你想要控制对比过程，那么请将自定义的比较函数通过第二个参数传入来实现。

```javascript
function MyComponent(props) {
  /* 使用 props 渲染 */
}
function areEqual(prevProps, nextProps) {
  /*
  如果把 nextProps 传入 render 方法的返回结果与
  将 prevProps 传入 render 方法的返回结果一致则返回 true，
  否则返回 false
  */
}
export default React.memo(MyComponent, areEqual);
```

此方法仅作为性能优化的方式而存在。但请不要依赖它来“阻止”渲染，因为这会产生 bug。

React.memo()和PureComponent很相似，都是用来控制组件何时渲染的。我们都知道当组件props和state发生改变时，当前组件以及其子孙组件会重新渲染，但是有一些组件（纯文本组件）是不需要重新渲染的，这种不需要的组件被重新渲染会影响整体的渲染性能。

请看以下代码
```javascript
//react 
const Child = (props) => {
  console.log('child update')
  return (
  <div>
    {props.text}
  </div>
  )
}

const App = () => {
  const [text, setText] = useState('我是文本');
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <Child text={text}/>
    </div>
  )
}
```

为什么我每点击一次按钮，控制台就回打印出'child update'?
当页面初始化完成之后，在手动点击button按钮时，请问控制台输出什么？？？
答案是：每当我点击一次button，count更改后，控制台会打印出 'child update'，意味着child组件重新渲染了，那么为什么count的变动会影响child组件。如果是vue用户，可能不会有这样的疑惑，因为在vue下，这种情况必不可能发生，例如：

```javascript
//child 
<template>
	<div>{{text}}</div>
</template>

export default {
    props: {
    	text: {
        	type: String,
        	default: ''
        }
    },
    mounted() {
    	console.log('child mounted')
    },
    updated() {
    	console.log('child update')
    }
}
// parent
<template>
	<div>
    	<button @click='countAdd'>
        	{{count}}
        </button>
        <Child :text='text'/>
    </div>
</template>

export default {
    data() {
    	return {
            count: 0,
            text: 'child'
        }
    },
    methods: {
    	countAdd() {
        	this.count ++;
        }
    }
    mounted() {
    	console.log('child mounted')
    },
    updated() {
    	console.log('child update')
    }
}

```

对于vue来说，这很好解释，child依赖parent传入的text，parent内count的变更，而text没有变动，所以child组件无需更新。那么问题回到最初，在react内父组件的state变更，没有依赖变更数据的子组件为什么会重新渲染。
数据的单向流动
对于vue来说，因为使用的是数据劫持的方式，所以可以很方便的知道哪里的数据进行了更新，因为知道数据改变的具体位置，那么组件的重新渲染是可控的，即在框架内部，vue自己就已经优化了组件渲染的时机，防止单一数据变动而引起的大规模的组件渲染，造成不必要的性能浪费，但是
React是单向数据流，数据主要从父节点传递到子节点（通过props）。
如果顶层（父级）的某个props改变了，React会重渲染所有的子节点，但是这样就会造成比较多的性能浪费，在react 16以下 class组件中 我们可以使用shouldComponentDidMount或者PureComponent来控制组件的渲染，但是在16.0以上函数式组件中，我们应该如何去优化组件渲染呢，标题来了：React.memo
React.memo
该api使得组件仅在它的 props 发生改变的时候进行重新渲染。通常来说，在组件树中 React 组件，只要有变化就会走一遍渲染流程。但是通过React.memo()，我们可以仅仅让某些组件进行渲染。

所以对于上面重复渲染子组件的方案，仅仅需要小小改造一下就行
```javascript
//react 
import {memo} from 'react';
const Child = memo((props) => {
  console.log('child update')
  return (
  <div>
    {props.text}
  </div>
  )
})
```

## useReducer

React本身不提供状态管理功能，通常需要使用外部库，这方面最常用的库是 Redux 。
Redux 的核心概念是，组件发出 action 与状态管理器通信。状态管理器收到 action 以后，使用 Reducer 函数算出新的状态， Reducer 函数的形式是 (state, action) => newState 。
**useReducer 是一个用于状态管理的 Hook Api** 。是 useState 的替代方案。
那么 useReducer 和 useState 的区别是什么呢？答案是 useState 是使用 useReducer 构建的。
const [state, dispatch] = useReducer(reducer, initialState);
复制代码
上面是 useReducer() 的基本用法，它接受 Reducer 函数和状态的初始值作为参数，返回一个数组。数组的第一个成员是状态的当前值，第二个成员是发送 action  的 dispatch 函数。

计数器示例：

```javascript
const initialState = 0;

const reducer = (state, action) => {
  switch (action) {
    case 'increment':
      return state + 1
    case 'decrement':
      return state - 1
    case 'reset':
      return initialState
    default:
      return state
  }
}

function UseReducerHook (){
    const [count, dispatch] = useReducer(reducer, initialState);
    return (
        <div>
            <div>Count - {count}</div>
            <button onClick={() => dispatch('increment')}>增加</button>
            <button onClick={() => dispatch('decrement')}>减少</button>
            <button onClick={() => dispatch('reset')}>重置</button>
      </div>
    )
}
```

## useContext

```javascript
const value = useContext(MyContext);
```
**接收一个 context 对象（React.createContext 的返回值）并返回该 context 的当前值。当前的 context 值由上层组件中距离当前组件最近的 <MyContext.Provider> 的 value prop 决定**。

当组件上层最近的 <MyContext.Provider> 更新时，该 Hook 会触发重渲染，并使用最新传递给 MyContext provider 的 context value 值。即使祖先使用 React.memo 或 shouldComponentUpdate，也会在组件本身使用 useContext 时重新渲染。

别忘记 useContext 的参数必须是 context 对象本身：

正确： useContext(MyContext)
错误： useContext(MyContext.Consumer)
错误： useContext(MyContext.Provider)
调用了 useContext 的组件总会在 context 值变化时重新渲染。如果重渲染组件的开销较大，你可以 通过使用 memoization 来优化。

提示

如果你在接触 Hook 前已经对 context API 比较熟悉，那应该可以理解，useContext(MyContext) 相当于 class 组件中的 static contextType = MyContext 或者 <MyContext.Consumer>。

useContext(MyContext) 只是让你能够读取 context 的值以及订阅 context 的变化。你仍然需要在上层组件树中使用 <MyContext.Provider> 来为下层组件提供 context。

把如下代码与 Context.Provider 放在一起

```javascript
const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee"
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222"
  }
};

const ThemeContext = React.createContext(themes.light);

function App() {
  return (
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}
```

## useCallback

**返回一个 memoized 回调函数。**

把内联回调函数及依赖项数组作为参数传入 useCallback，它将返回该回调函数的 memoized 版本，该回调函数仅在某个依赖项改变时才会更新。当你把回调函数传递给经过优化的并使用引用相等性去避免非必要渲染（例如 shouldComponentUpdate）的子组件时，它将非常有用。

useCallback(fn, deps) 相当于 useMemo(() => fn, deps)。

```javascript
const memoizedCallback = useCallback(
  () => {
    doSomething(a);
  },
  [a],
);
```

通俗来讲当参数 a 发生变化时，会返回一个新的函数引用赋值给 memoizedCallback 变量，因此这个变量就可以当做 useEffect 第二个参数。这样就有效的将逻辑分离出来。
针对上述请求数据例子，我们使用 useCallback 改写下：

```javascript
const Person = ({ fetchData }) => {
    const [loading, setLoading] = useState(true);
    const [person, setPerson] = useState({});
  
    useEffect(() => {
      setLoading(true);
       fetchData().then(response => response.json())
        .then(data => {
          setPerson(data);
          setLoading(false);
        });
    }, [fetchData]); //{2}
  
    if (loading === true) {
      return <p>Loading ...</p>;
    }
  
    return (
      <div>
        <p>You're viewing: {person.name}</p>
        <p>Height: {person.height}</p>
        <p>Mass: {person.mass}</p>
      </div>
    );
  };

function UseEffectHook(){
    const [personId, setPersonId] = useState("1");

    const fetchData = useCallback(()=>{
       return fetch(`https://v1/api/people/${personId}/`);
    },[personId]);//{1}

    return (
        <>
            <Person fetchData={fetchData} />
            <div>
                Show:
                <button onClick={() => setPersonId("1")}>button 1</button>
                <button onClick={() => setPersonId("2")}>button 2</button>
            </div>
        </>
    )
}

```

经过 useCallback 包装过的函数可以当作普通变量作为 useEffect 的依赖。 useCallback做的事情，就是在其依赖变化时，返回一个新的函数引用，触发 useEffect 的依赖变化，并激活其重新执行。
现在我们不需要在 useEffect 依赖中直接对比 personId 参数了，而可以直接对比 fetchData 函数。 useEffect 只要关心 fetchData 函数是否变化，而 fetchData 参数的变化在 useCallback 时关心，能做到：依赖不丢、逻辑内聚，从而容易维护。

## useMemo

**返回一个 memoized 值。**

把“创建”函数和依赖项数组作为参数传入 useMemo，它仅会在某个依赖项改变时才重新计算 memoized 值。这种优化有助于避免在每次渲染时都进行高开销的计算。

记住，传入 useMemo 的函数会在渲染期间执行。请不要在这个函数内部执行不应该在渲染期间内执行的操作，诸如副作用这类的操作属于 useEffect 的适用范畴，而不是 useMemo。

**如果没有提供依赖项数组，useMemo 在每次渲染时都会计算新的值。**

你可以把 useMemo 作为性能优化的手段，但不要把它当成语义上的保证。将来，React 可能会选择“遗忘”以前的一些 memoized 值，并在下次渲染时重新计算它们，比如为离屏组件释放内存。先编写在没有 useMemo 的情况下也可以执行的代码 —— 之后再在你的代码中添加 useMemo，以达到优化性能的目的。

把“创建”函数和依赖项数组作为参数传入 useMemo ，它仅会在某个依赖项改变时才重新计算 memoized 值。这种优化有助于避免在每次渲染时都进行高开销的计算。
跟 useCallback 非常类似的功能， useMemo 相当于 Class 组件的 pureComponent 。
我们再接着上述案例使用 useMemo 修改下：

```javascript
const fetchData = useMemo(()=>{
	return ()=>fetch(`https://v1/api/people/${personId}/`);
},[personId]);
```

其余都不变，唯独多加了一层 ()=>fn 结构。
如果没有提供依赖项数组， useMemo 在每次渲染时都会计算新的值。

## useCallback 和 useMemo 的区别

|        | useCallBack | useMemo |
| ------ | ------- | ------- |
| 返回值 | 一个缓存的回调函数 | 一个缓存的值 |
| 参数 | 需要缓存的函数，依赖项 | 需要缓存的值(也可以是个计算然后再返回值的函数) ，依赖项 |
| 使用场景 | **父组件更新时，通过props传递给子组件的函数也会重新创建，然后这个时候使用 useCallBack 就可以缓存函数不使它重新创建** | **组件更新时，一些计算量很大的值也有可能被重新计算，这个时候就可以使用 useMemo 直接使用上一次缓存的值** |

## Refs

Refs 是一个获取 DOM 节点或 React 元素实例的工具。在 React 中 Refs 提供了一种方式，允许用户访问 DOM 节点或 render 方法中创建的 React 元素。

### 类组件如何创建 ref

**当 ref 属性用于 HTML 元素时，构造函数中使用 React.createRef() 创建的 ref 接收底层 DOM 元素作为其 current 属性；**
**当 ref 属性用于自定义 class 组件时，ref 对象接收组件的挂载实例作为其 current 属性；**
你不能在函数组件上使用 ref 属性，因为他们没有实例。

```javascript
class Child extends React.Component{
    render() {
        return <div>Child</div>;
    }
}

class ClassRefComp extends React.Component {
    constructor(props) {
      super(props);
      this.myRef = React.createRef();
    }
    componentDidMount(){
        console.log(this.myRef.current);
    }
    render() {
      return (
          <>
            {/* this.myRef.current 获取到 Child 实例 */}
            <Child ref={this.myRef} /> 
            {/* this.myRef.current 获取 div 元素 */}
            {/* <div ref={this.myRef} /> */}
          </>
      )
    }
}
```

不能在函数组件上使用 ref 属性

例如下面做会报错：

```javascript
function Child2(){
    return (
        <div>不能在函数组件上使用 ref 属性</div>
    )
}

class ClassRefComp extends React.Component {
    constructor(props) {
      super(props);
      this.myRef = React.createRef();
    }
    componentDidMount(){
        console.log(this.myRef.current);
    }
    render() {
      return (
          <>
            <Child2 ref={this.myRef} />
          </>
      )
    }
}
```

Child2 是函数组件，不能使用 ref 属性，因为他们没有实例，解决方案：

改成 class 组件

React.forwardRef 进行包装

### React.forwardRef

```javascript
let Child2 = (props,ref)=>{
    return (
        <div ref={ref}>不能在函数组件上使用 ref 属性</div>
    )
}

Child2 = React.forwardRef(Child2);
```

代码解释：

我们通过调用 React.createRef 创建了一个 React ref 并将其赋值给 myRef 变量；
我们通过指定 ref 为 JSX 属性，将其向下传递给 <Child2 ref={this.myRef}> ；
React 传递 ref 给 forwardRef 内函数 (props, ref) => ...，作为其第二个参数；
我们向下转发该 ref 参数到 <div ref={ref}>，将其指定为 JSX 属性；
当 ref 挂载完成，ref.current 将指向 <div> DOM 节点。

React.forwardRef 解决了，函数组件没有实例，无法像类组件一样可以接收 ref 属性的问题
到这里想必你也应该清楚 Refs 是什么以及在类组件中如何使用了，至于它的一些其他用法例如“回调 Refs ”、“高阶组件中转发 Refs ”这里就不一一讲解了。

### 函数组件如何创建ref

useRef 返回一个可变的 ref 对象，其 current 属性被初始化为传入的参数（ initialValue ）。返回的 ref 对象在组件的整个生命周期内保持不变。

useRef 的作用：

获取 DOM 元素的节点；
获取子组件的实例；
渲染周期之间共享数据的存储（ state 不能存储跨渲染周期的数据，因为 state 的保存会触发组件重渲染）。

```javascript
function FuncRefComp(){
    const inputRef = useRef(null);

    const handleChange = ()=>{
        console.log(inputRef.current.value);
    }

    return (
        <input ref={inputRef} type="text" onChange={handleChange} />
    )
}
```

本质上，useRef 就像是可以在其 .current 属性中保存一个可变值的“盒子”。

你应该熟悉 ref 这一种访问 DOM 的主要方式。如果你将 ref 对象以 <div ref={myRef} /> 形式传入组件，则无论该节点如何改变，React 都会将 ref 对象的 .current 属性设置为相应的 DOM 节点。

然而，useRef() 比 ref 属性更有用。它可以很方便地保存任何可变值，其类似于在 class 中使用实例字段的方式。

这是因为它创建的是一个普通 Javascript 对象。而 useRef() 和自建一个 {current: ...} 对象的唯一区别是，**useRef 会在每次渲染时返回同一个 ref 对象**。

请记住，**当 ref 对象内容发生变化时，useRef 并不会通知你。变更 .current 属性不会引发组件重新渲染**。如果想要在 React 绑定或解绑 DOM 节点的 ref 时运行某些代码，则需要使用回调 ref 来实现。

## createRef 和 useRef的区别

我们知道useRef是hooks新增的API，在类函数中肯定无法使用。那createRef在函数组件中可以使用吗？我们试一下。写一个简单的点击button设置input focus的效果。

```javascript
const createRefInFunction = () => {
    const myRef = createRef(null);
    return (
        <div>
            <input ref={myRef}></input>
            <button
                onClick={() => {
                    myRef.current.focus();
                }}
            >
                set focus
            </button>
        </div>
    );
};

export default createRefInFunction;
```

结果发现createRef在函数组件中也是可用的，那为什么还要新增一个useRef API呢？
看下useRef定义，我们发现官方文档已经说出了它区别于createRef的地方：

useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数（initialValue）。返回的 ref 对象在组件的整个生命周期内保持不变。

由此可以知道，createRef 每次渲染都会返回一个新的引用，而 useRef 每次都会返回相同的引用。 从文字来看可能比较难理解，我们写一个简单demo就能明白了。

```javascript
const useRefAndCreateRefDiffrent = () => {
    const [renderIndex, setRenderIndex] = useState(1);
    const refFromUseRef = useRef();
    const refFromCreateRef = createRef();
    if (!refFromUseRef.current) {
        refFromUseRef.current = renderIndex;
    }

    if (!refFromCreateRef.current) {
        refFromCreateRef.current = renderIndex;
    }

    return (
        <div>
            <p>current render index is: {renderIndex}</p>
            <p>refFromUseRef render index is: {refFromUseRef.current}</p>
            <p>refFromCreateRef render index is: {refFromCreateRef.current}</p>
            <button
                onClick={() => {
                    setRenderIndex((prev) => prev + 1);
                }}
            >
                增加render index
            </button>
        </div>
    );
};
```

当index已经增加到了7，createRef显示7，而useRef只显示1。可以知道，随着render重新渲染，createRef的值也每次都重新渲染了。而useRef只初始化了一次，所以才最后显示1。

由此得知**createRef会在组件每次渲染的时候重新创建，useRef只会在组件首次渲染时创建**

