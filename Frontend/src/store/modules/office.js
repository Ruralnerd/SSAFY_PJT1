import axios from "axios"

const notiAPI = axios.create({
  baseURL: `/api/v1/notifications`,
})

const todoAPI = axios.create({
  baseURL: `/api/v1/todos`,
})

const userAPI = axios.create({
  baseURL: `/api/v1/users`,
})

const roomAPI = axios.create({
  // Local test URL
  // baseURL: `http://i5d207.p.ssafy.io:8997/rooms`,

  // deploy URL
  baseURL: `https://i5d207.p.ssafy.io:8995/rooms`,
})

const officeAPI = axios.create({
  baseURL: `/api/v1/office`,
})

// 병훈
export const office = {
  namespaced: true,
  state: {
    notifications: [],
    todos: [],
    members: [],
    rooms: [],
    depts: [],
    jobs: [],
  },
  mutations: {
    setNotifications(state, notis) {
      state.notifications = notis
    },
    setTodos(state, todos) {
      state.todos = todos
    },
    setMembers(state, members) {
      state.members = members.map(member => {
        return { ...member, connected: false }
      })
    },
    updateProfileOfMembers(state, newUser) {
      state.members = state.members.map(member => {
        if (member.userId === newUser.userId) {
          return {
            ...member,
            ...newUser,
          }
        }
        return member
      })
    },
    updateMemberProfileImage(state, { userId, newProfileImage }) {
      console.log(newProfileImage)
      state.members.forEach(member => {
        if (member.userId === userId) {
          member.profileImage = newProfileImage
        }
      })
    },
    updateConnectionOfMembers(state, targetMembers) {
      const targetMemberIdList = Object.keys(targetMembers).map(
        memberId => +memberId
      )
      state.members.forEach(member => {
        if (targetMemberIdList.includes(member.userId)) {
          member.connected = true
          member.roomId = targetMembers[`${member.userId}`].roomId
        } else {
          member.connected = false
        }
      })
    },
    setRooms(state, rooms) {
      state.rooms = rooms
    },
    setDepts(state, depts) {
      state.depts = depts
    },
    setJobs(state, jobs) {
      state.jobs = jobs
    },
  },
  getters: {
    lobbyId(state) {
      if (!state.rooms) return
      return state.rooms[0].roomId
    },
    user(state) {
      return state.user
    },
    sortedMembersByOnline(state) {
      const members = [...state.members]
      return members.sort((a, b) => {
        return a.connected === b.connected ? 0 : a.connected ? -1 : 1
      })
    },
    sortedTodosByDone(state) {
      const todos = [...state.todos]
      return todos.sort((todo1, todo2) => {
        return todo1.done === todo2.done
          ? todo1.day > todo2.day
            ? -1
            : 1
          : todo1.done
          ? 1
          : -1
      })
    },
  },
  actions: {
    async getDepts({ commit }) {
      try {
        const res = await officeAPI({
          method: "get",
          url: "depts",
        })
        commit("setDepts", res.data)
        return res.data
      } catch (error) {
        console.log(error)
        throw Error("부서 목록을 불러오는 데 실패했습니다.")
      }
    },
    async getJobs({ commit }) {
      try {
        const res = await officeAPI({
          method: "get",
          url: "jobs",
        })
        commit("setJobs", res.data)
        return res.data
      } catch (error) {
        console.log(error)
        throw Error("역할 목록을 불러오는 데 실패했습니다.")
      }
    },
    async registerOffice({ rootState }, formData) {
      try {
        const res = await officeAPI({
          method: "post",
          url: "",
          data: formData,
        })
        console.log(res)
        return res
      } catch (error) {
        console.log("error:", error)
        throw Error("회사등록 실패")
      }
    },
    async getNotifications({ commit, rootState }) {
      try {
        const res = await notiAPI({
          method: "GET",
          url: "",
          headers: {
            accessToken: rootState.auth.accessToken,
          },
        })
        commit("setNotifications", res.data)
      } catch (error) {
        console.log(error)
      }
    },
    async deleteNotification({ commit, state, rootState }, notiId) {
      try {
        await notiAPI({
          method: "DELETE",
          url: `/${notiId}`,
          headers: {
            accessToken: rootState.auth.accessToken,
          },
        })
        const notis = state.notifications.filter(noti => noti.notiId !== notiId)
        commit("setNotifications", notis)
      } catch (error) {
        console.log(error)
      }
    },
    async getTodos({ commit, rootState }, userId) {
      try {
        const res = await todoAPI({
          method: "",
          url: "",
          params: {
            userId,
          },
          headers: {
            accessToken: rootState.auth.accessToken,
          },
        })
        if (rootState.auth.user.userId === userId) {
          commit("setTodos", res.data)
        }
        return res.data
      } catch (error) {
        console.log(error)
      }
    },
    async createTodo({ commit, state, rootState }, todoData) {
      try {
        const res = await todoAPI({
          method: "POST",
          data: {
            officeId: rootState.auth.user.officeId,
            userId: rootState.auth.user.userId,
            ...todoData,
          },
          headers: {
            accessToken: rootState.auth.accessToken,
          },
        })
        const todos = [...state.todos]
        todos.push(res.data)
        commit("setTodos", todos)
      } catch (error) {
        console.log(error)
      }
    },
    async deleteTodo({ commit, state, rootState }, todoId) {
      try {
        await todoAPI({
          method: "DELETE",
          url: `/${todoId}`,
          headers: {
            accessToken: rootState.auth.accessToken,
          },
        })
        const todos = state.todos.filter(todo => todo.todoId !== todoId)
        commit("setTodos", todos)
      } catch (error) {
        console.log(error)
      }
    },
    async toggleTodoDone({ commit, state, rootState }, todoId) {
      console.log(todoId)
      await todoAPI({
        method: "PUT",
        url: `/${todoId}`,
        headers: {
          accessToken: rootState.auth.accessToken,
        },
      })
      const todos = state.todos.map(todo => {
        if (todo.todoId === todoId) {
          todo.done = !todo.done
        }
        return todo
      })
      commit("setTodos", todos)
    },
    async getMembers({ commit, rootState }) {
      try {
        const res = await userAPI({
          params: {
            officeId: rootState.auth.user.officeId,
          },
          headers: {
            accessToken: rootState.auth.accessToken,
          },
        })
        commit("setMembers", res.data)
      } catch (error) {
        console.log(error)
      }
    },
    getMember({ rootState }, userId) {
      return userAPI({
        url: `/${userId}`,
        headers: {
          accessToken: rootState.auth.accessToken,
        },
      })
    },

    async getRooms({ commit, rootState }, officeId) {
      try {
        const res = await roomAPI({
          method: "GET",
          params: {
            officeId: rootState.auth.user.officeId,
          },
          headers: {
            accessToken: rootState.auth.accessToken,
          },
        })
        commit("setRooms", res.data)
      } catch (error) {
        console.dir(error)
      }
    },
    // --------------------------------------------------------------------------------
    async createRoom({ commit, state, rootState }, roomData) {
      try {
        const res = await roomAPI({
          method: "POST",
          url: ``,
          data: roomData,
          headers: {
            accessToken: rootState.auth.accessToken,
          },
        })
        const rooms = [...state.rooms]
        rooms.push(res.data)
        commit("setRooms", rooms)
      } catch (error) {
        throw Error("❌ 방 생성에 실패했습니다.")
      }
    },
    // --------------------------------------------------------------------------------
    async editRoom({ commit, state, rootState }, { room, roomId }) {
      try {
        const res = await roomAPI({
          method: "PUT",
          url: `/${roomId}`,
          data: { roomName: room.name },
          headers: {
            accessToken: rootState.auth.accessToken,
          },
        })
        const rooms = state.rooms.map(room => {
          console.log(room)
          if (room.roomId === roomId) {
            room.roomName = res.data.roomName
          }
          return room
        })
        commit("setRooms", rooms)
      } catch (error) {
        throw Error("회의실을 수정하다 문제가 생겼어요.")
      }
    },

    async deleteRoom({ commit, state, rootState }, roomId) {
      try {
        await roomAPI({
          method: "DELETE",
          url: `/${roomId}`,
          headers: {
            accessToken: rootState.auth.accessToken,
          },
        })
        // DB에서는 삭제됐으나 front에서는 삭제가 안된 상태로 렌더링 되므로
        // filter를 이용해서 렌더링에서 제외시켜버린다
        console.log(`${roomId}번 회의실이 삭제됨니덩`)
        const rooms = state.rooms.filter(room => room.roomId !== roomId)
        commit("setRooms", rooms)
      } catch (error) {
        throw Error("회의실을 삭제하던 중 문제가 발생했어요.")
      }
    },
  },
}
