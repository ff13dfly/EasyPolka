function getMKTitles (mkContent) {
    var nav = []
    var navLevel = []
  
    mkContent
      .replace(/```/g, function () {
        return '\f'
      })
      .replace(/\f[^\f]*?\f/g, function (match) {
        return ''
      })
      .replace(/\r|\n+/g, function (match) {
        return '\n'
      })
      .replace(/(#+)[^\n]*?(?:\n)/g, function (match, m1, m2) {
        var title = match.replace('\n', '')
        var level = m1.length
        nav.push({
          title: title.replace(/^#+/, '').replace(/\([^)]*?\)/, ''),
          level: level,
          children: []
        })
        if (navLevel.indexOf(level) === -1 && level !== 1) { // =1 为标题
          navLevel.push(level)
        }
      })
  
    // 去掉title
    if (nav[0].level === 1) {
      nav.shift()
    }
  
    var index = 0
    nav = nav.map(item => {
      item.index = index++
      return item
    })
  
    navLevel = navLevel.sort()
  
    var retNavs = []
    var toAppendNavList
  
    navLevel.forEach(level => {
      toAppendNavList = find(nav, {
        level: level
      })
  
      if (retNavs.length === 0) {
        retNavs = retNavs.concat(toAppendNavList)
      } else {
        toAppendNavList.forEach(toAppendNav => {
          toAppendNav = Object.assign(toAppendNav)
          let parentNavIndex = getParentIndex(nav, toAppendNav.index)
  
          return appendToParentNav(retNavs, parentNavIndex, toAppendNav)
        })
      }
    })
  
    // 同一级的Level不一样的时候，需要做顺序调整
    retNavs = retNavs.map(navItem => {
      var children = navItem.children || []
      if (children.length === 0) {
        return navItem
      }
      navItem.children = indexSort(navItem.children)
      return navItem
    })
  
    return {
      nav: retNavs, // 所有mk标题
      navLevel: navLevel, // 所有标题层级
      length: nav.length // 标题长度
    }
  }
  
  function find (arr, condition) {
    return arr.filter(item => {
      for (var key in condition) {
        if (condition.hasOwnProperty(key) && condition[key] !== item[key]) {
          return false
        }
      }
      return true
    })
  }
  
  function findIndex (arr, condition) {
    let ret = -1
    arr.forEach((item, index) => {
      for (var key in condition) {
        if (condition.hasOwnProperty(key) && condition[key] !== item[key]) { // 不进行深比较
          return false
        }
      }
      ret = index
    })
    return ret
  }
  
  function getParentIndex (nav, endIndex) {
    for (var i = endIndex - 1; i >= 0; i--) {
      if (nav[endIndex].level > nav[i].level) {
        return nav[i].index
      }
    }
  }
  
  function appendToParentNav (nav, parentIndex, newNav) {
    // 先第一级里面找，找不到再去children中去找
    let index = findIndex(nav, {
      index: parentIndex
    })
  
    if (index === -1) {
      let subNav
  
      for (var i = 0; i < nav.length; i++) {
        subNav = nav[i]
        subNav.children.length && appendToParentNav(subNav.children, parentIndex, newNav)
      }
    } else {
      nav[index].children = nav[index].children.concat(newNav)
    }
  }
  
  function indexSort (navList) {
    // 有子元素，检查level是否相同
    var needSort = find(navList, {
      level: navList[0].level
    }).length !== navList.length
  
    if (needSort === false) return navList
  
    return navList.map(nav => {
      return nav.index
    }).sort().map(index => {
      var nav = find(navList, {
        index: index
      })
  
      if ((nav.children || []).length > 1) {
        nav.children = indexSort(nav.children)
      }
  
      return nav[0]
    })
  }
  
  export default getMKTitles