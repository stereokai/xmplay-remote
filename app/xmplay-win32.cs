using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.ComponentModel;

namespace XMPlayInterface {
  public enum WA_IPC {
    WM_WA_IPC = 1024,
    IPC_ISPLAYING = 104,
    IPC_GETOUTPUTTIME = 105,
    IPC_GETLISTLENGTH = 124,
    IPC_SETPLAYLISTPOS = 121,
    IPC_GETLISTPOS = 125,
    IPC_GETPLAYLISTFILE = 211,
    IPC_GETPLAYLISTTITLE = 212
  }

  public enum IPC_PLAYINGSTATUS {
    PLAYING = 1,
    PAUSED = 3,
    STOPPED = 0,
  }

  public static class XMPlay {
    public static IntPtr hXMPlayWnd = FindWindow("XMPLAY-MAIN", null);
    public static Process xmplayProcess = Process.GetProcessesByName("XMPlay")[0];

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr FindWindow([MarshalAs(UnmanagedType.LPTStr)] string lpClassName, [MarshalAs(UnmanagedType.LPTStr)] string lpWindowName);
    [DllImport("Kernel32.dll", CharSet = CharSet.Auto)]
    public static extern bool ReadProcessMemory(IntPtr hProcess, IntPtr lpBaseAddress, byte[] lpBuffer, UInt32 nSize, ref UInt32 lpNumberOfBytesRead);
    [DllImport("Kernel32.dll", SetLastError = true)]
    public static extern IntPtr OpenProcess(UInt32 dwDesiredAccess, bool bInheritHandle, UInt32 dwProcessId);
    [DllImport("Kernel32.dll")]
    public static extern int CloseHandle(int handle);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern IntPtr SendMessage(IntPtr hWnd, int wMsg, int wParam, uint lParam);

    private static bool isValidHandle (IntPtr hWnd) {
      return hWnd != IntPtr.Zero;
    }

    private static string readStringFromWinampMemory(IntPtr winampMemoryAddress) {
      string str = "";

      IntPtr handle = OpenProcess(0x0010, false, (uint) xmplayProcess.Id);

      byte[] buff = new byte[88];
      UInt32 ret = new UInt32();

      IntPtr pos = winampMemoryAddress;

      if (ReadProcessMemory(handle, pos, buff, 88, ref ret)) {
        System.Text.Encoding encoding = System.Text.Encoding.Default;
        str = encoding.GetString(buff);
      }
      return str;
    }

    public static string[] getPlaylist() {
      int len = SendMessage(hXMPlayWnd, (int) WA_IPC.WM_WA_IPC, 0, (uint) WA_IPC.IPC_GETLISTLENGTH).ToInt32();
      string[] listNames = new string[len];

      for (int i = 0; i < len; i++) {
        IntPtr pointer = SendMessage(hXMPlayWnd, (int) WA_IPC.WM_WA_IPC, i, (uint) WA_IPC.IPC_GETPLAYLISTTITLE);
        listNames[i] = readStringFromWinampMemory(pointer);
      }
      return listNames;
    }

    public static int getElapsedTime() {
      preCheck();

      IntPtr resultPtr = SendMessage(hXMPlayWnd, (int) WA_IPC.WM_WA_IPC, 0, (uint) WA_IPC.IPC_GETOUTPUTTIME);

      return resultPtr.ToInt32();
    }

    public static int getPlayingStatus() {
      preCheck();

      IntPtr resultPtr = SendMessage(hXMPlayWnd, (int) WA_IPC.WM_WA_IPC, 0, (uint) WA_IPC.IPC_ISPLAYING);

      return resultPtr.ToInt32();
    }

    private static void preCheck() {
      if (!isValidHandle(hXMPlayWnd))
        throw new Win32Exception(Marshal.GetLastWin32Error());
    }
  }

  public class XMPlayController {
    public async Task <object> getPlaylist(dynamic input) {
      return XMPlay.getPlaylist();
    }

    public async Task <object> getPlayingStatus(dynamic input) {
      return XMPlay.getPlayingStatus();
    }

    public async Task <object> getElapsedTime(dynamic input) {
      return XMPlay.getElapsedTime();
    }
  }
}