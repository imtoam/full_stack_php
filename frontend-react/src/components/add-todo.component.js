import React, { Component } from "react";
import { connect } from "react-redux";
import { createTodo } from "../actions/todos";

class AddToDo extends Component {
    constructor(props) {
      super(props);
      this.onChangeTask = this.onChangeTask.bind(this);
      this.onChangeDue = this.onChangeDue.bind(this);
      this.onChangeStatus = this.onChangeStatus.bind(this);
      this.saveTodo = this.saveTodo.bind(this);
      this.newTodo = this.newTodo.bind(this);
  
      this.state = {
        id: null,
        task: "",
        due: null,
        status: "pending",
        submitted: false,
      };
    }
  
    onChangeTask(e) {
      this.setState({
        task: e.target.value,
      });
    }
  
    onChangeDue(e) {
        this.setState({
          due: e.target.value,
        });
    }

    onChangeStatus(e) {
      this.setState({
        status: e.target.value,
      });
    }
  
    saveTodo() {
      const { task, due, status } = this.state;
  
      this.props
        .createTodo(task, due, status)
        .then((data) => {
          this.setState({
            id: data.id,
            task: data.task,
            due: data.due,
            status: data.status,
            submitted: true,
          });
          console.log(data);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  
    newTodo() {
      this.setState({
        id: null,
        task: "",
        due: null,
        status: "pending",
        submitted: false,
      });
    }
  
    render() {
        return (
            <div className="submit-form">
              {this.state.submitted ? (
                <div>
                  <h4>You submitted successfully!</h4>
                  <button className="btn btn-success" onClick={this.newTodo}>
                    Add
                  </button>
                </div>
              ) : (
                <div>
                  <div className="form-group">
                    <label htmlFor="task">Task</label>
                    <input
                      type="text"
                      className="form-control"
                      id="task"
                      required
                      value={this.state.task}
                      onChange={this.onChangeTask}
                      name="task"
                    />
                  </div>
      
                  <div className="form-group">
                    <label htmlFor="due">Due</label>
                    <input
                      type="date"
                      className="form-control"
                      id="due"
                      required
                      value={this.state.due}
                      onChange={this.onChangeDue}
                      name="due"
                    />
                  </div>
      
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <input
                      type="text"
                      className="form-control"
                      id="status"
                      required
                      value={this.state.status}
                      onChange={this.onChangeStatus}
                      name="status"
                    />
                  </div>

                  <button onClick={this.saveTodo} className="btn btn-success">
                    Submit
                  </button>
                </div>
              )}
            </div>
          );
    }
  }
  
  export default connect(null, { createTodo })(AddToDo);