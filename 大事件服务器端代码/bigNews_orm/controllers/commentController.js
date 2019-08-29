const { Comment } = require("../db")

// 服务器内部错误
const serverError = res => {
  res.send({
    code: 500,
    msg: "服务器内部错误"
  })
}

module.exports = {
  // 最新评论
  async comment_search(req, res) {
    let { page, perpage } = req.query
    page = parseInt(page)
    perpage = parseInt(perpage)
    if (!page) {
      page = 1
    }
    if (!perpage) {
      perpage = 6
    }
    // console.log(perpage);
    // 分页数据判断
    if (typeof page != "number" || typeof perpage != "number") {
      return res.send({
        code: 400,
        msg: "页码，或者页容量类型错误"
      })
    }
    // 计算跳过的页码
    const offset = (page - 1) * perpage
    try {
      // 分页查询
      let pageCommentRes = await Comment.findAll({
        order: [
          // 根据id倒序
          ["id", "DESC"]
        ],
        // 分页
        limit: perpage,
        // 跳过页码
        offset
      })

      // 总页数
      let totalCommentRes = await Comment.findAll();
      let pages = Math.ceil(totalCommentRes.length / perpage);
      res.send({
        code: 200,
        msg: "数据获取成功",
        pages: pages,
        page: page,
        data: {
          totalCount: totalCommentRes.length,
          data: pageCommentRes
        }
      })
    } catch (error) {
      // console.log(error);
      // console.log(11);
      serverError(res)
    }
  },
  // 评论审核通过
  async pass(req, res) {
    // 获取id
    const { id } = req.body
    try {
      // 查询数据
      const commentRes = await Comment.findOne({
        where: {
          id
        }
      })
      // id判断
      if (!commentRes) {
        res.send({
          code: 400,
          msg: "id有误,请检查"
        })
      }
      // 修改评论状态
      const updateRes = await Comment.update(
        {
          state: "已通过"
        },
        {
          where: {
            id
          }
        }
      )
      if (updateRes[0] == 1) {
        res.send({
          msg: "已批准",
          code: 200
        })
      } else {
        res.send({
          msg: "已批准，不要重复操作",
          code: 400
        })
      }
    } catch (error) {
      serverError(res)
    }
  },
  // 评论审核不通过
  async reject(req, res) {
    // 获取id
    const { id } = req.body
    try {
      // 查询数据
      const commentRes = await Comment.findOne({
        where: {
          id
        }
      })
      // id判断
      if (!commentRes) {
        res.send({
          code: 400,
          msg: "id有误,请检查"
        })
      }
      // 修改评论状态
      const updateRes = await Comment.update(
        {
          state: "已拒绝"
        },
        {
          where: {
            id
          }
        }
      )
      if (updateRes[0] == 1) {
        res.send({
          msg: "已拒绝",
          code: 200
        })
      } else {
        res.send({
          msg: "已拒绝，不要重复操作",
          code: 400
        })
      }
    } catch (error) {
      serverError(res)
    }
  },
  // 删除评论
  async _delete(req, res) {
    // 获取id
    const { id } = req.body
    try {
      // 查询数据
      const commentRes = await Comment.findOne({
        where: {
          id
        }
      })
      // id判断
      if (!commentRes) {
        res.send({
          code: 400,
          msg: "id有误,请检查"
        })
      }
      // 修改评论状态
      const destroyRes = await Comment.destroy({
        where: {
          id
        }
      })
      res.send({
        msg: "已删除",
        code: 200
      })
    } catch (error) {
      serverError(res)
    }
  }
}
