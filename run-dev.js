const { spawn } = require("child_process")
const path = require("path")

// Function to run a command in a specific directory
function runCommand(command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
  })

  child.on("error", (error) => {
    console.error(`Error running ${command}: ${error.message}`)
  })

  return child
}

// Start the backend server
console.log("Starting backend server...")
const backendProcess = runCommand("npm", ["run", "dev"], path.join(__dirname, "backend"))

// Start the frontend server
console.log("Starting frontend server...")
const frontendProcess = runCommand("npm", ["run", "dev"], path.join(__dirname, "frontend"))

// Handle process termination
process.on("SIGINT", () => {
  console.log("Shutting down servers...")
  backendProcess.kill()
  frontendProcess.kill()
  process.exit()
})
