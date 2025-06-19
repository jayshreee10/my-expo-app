import React, { useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Task = {
  id: string;
  title: string;
  done: boolean;
};

export default function App() {
  const [task, setTask] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = () => {
    if (task.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: task,
        done: false,
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setTask("");
    }
  };

  const toggleTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id));
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.taskContainer}>
      <TouchableOpacity onPress={() => toggleTask(item.id)}>
        <Text style={[styles.taskText, item.done && styles.doneText]}>
          {item.title}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Text style={styles.deleteText}>❌</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>ToDo App</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a task..."
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addText}>➕</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  inputContainer: { flexDirection: "row", marginBottom: 20 },
  input: {
    flex: 1,
    borderColor: "#aaa",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 8,
  },
  addText: { fontSize: 20, color: "white" },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  taskText: { fontSize: 18 },
  doneText: { textDecorationLine: "line-through", color: "gray" },
  deleteText: { fontSize: 18, color: "red" },
});
