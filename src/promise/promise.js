/**
 * 实现 Promise
 */

function resolvePromise(promise2, x, resolve, reject) {
  // 循环引用报错
  if (x === promise2) {
    // reject 报错抛出
    return reject(new TypeError('Chaining cycle detected for promise'))
  }
  // 锁，防止多次调用
  let called

  // x不是null 且x是对象或者函数
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      // A+ 规定，声明then = x的then方法
      let then = x.then
      // 如果then是函数，就默认是promise了
      if (typeof then === 'function') {
        // 就让then执行 第一个参数是this   后面是成功的回调 和 失败的回调
        then.call(
          x,
          y => {
            // 成功和失败只能调用一个
            if (called) return
            called = true
            // resolve的结果依旧是promise 那就继续递归执行
            resolvePromise(promise2, y, resolve, reject)
          },
          err => {
            // 成功和失败只能调用一个
            if (called) return
            called = true
            reject(err) // 失败了就失败了
          }
        )
      } else {
        resolve(x) // 直接成功即可
      }
    } catch (e) {
      // 也属于失败
      if (called) return
      called = true
      // 取then出错了那就不要在继续执行了
      reject(e)
    }
  } else {
    resolve(x)
  }
}

class Promise {
  constructor(executor) {
    this.status = 'pending' // 默认promise状态
    this.value // resolve成功时的值
    this.error // reject失败时的值
    this.resolveQueue = [] // 成功时回调队列
    this.rejectQueue = [] // 失败时回调队列

    let resolve = value => {
      if (this.status === 'pending') {
        this.value = value
        this.status = 'resolved'
        this.resolveQueue.forEach(fn => fn())
      }
    }

    let reject = value => {
      if (this.status === 'pending') {
        this.error = value
        this.status = 'rejected'
        this.rejectQueue.forEach(fn => fn())
      }
    }

    executor(resolve, reject)
  }

  then(onFullfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : err => {
            throw err
          }

    let promise2
    promise2 = new Promise((resolve, reject) => {
      if (this.status === 'resolved') {
        // 异步
        setTimeout(() => {
          let x = onFullfilled(this.value)
          // resolvePromise函数，处理自己return的promise和默认的promise2的关系
          resolvePromise(promise2, x, resolve, reject)
        }, 0)
      }
      if (this.status === 'rejected') {
        // 异步
        setTimeout(() => {
          let x = onRejected(this.value)
          resolvePromise(promise2, x, resolve, reject)
        }, 0)
      }
      if (this.status === 'pending') {
        this.resolveQueue.push(() => {
          // 异步
          setTimeout(() => {
            let x = onFullfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          }, 0)
        })
        this.rejectQueue.push(() => {
          // 异步
          setTimeout(() => {
            let x = onRejected(this.error)
            resolvePromise(promise2, x, resolve, reject)
          }, 0)
        })
      }
    })

    // 返回 promise，达成链式效果
    return promise2
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }
}

Promise.all = function (iterators) {
  let promises = Array.from(iterators)
  let count = 0
  let res = []
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promise.length; i++) {
      promises[i].then(res => {
        res.push(res)
        count++
        if (count === promises.length) resolve(res)
      })
    }
  }).catch(err => {
    reject(err)
  })
}
