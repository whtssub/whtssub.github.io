---
layout: default
title: "A Handy Guide to Virtual Machine Networking"
date: 2023-02-28
categories:
  - virtualization
  - networking
  - vms
  - linux
excerpt: "VM networking demystified: NAT, bridged, and host-only setups, WiFi in bare VMs, connectivity checks, and troubleshooting with practical tools and commands."
---

Ah, Virtual Machines. The perfect way to spend your time feeling like a mad scientist with a questionable hairstyle. I spent so much time trying to figure out the right connectivity that I started to feel like I needed a degree in electrical engineering just to get my VMs to talk to each other. But fear not, dear friend, for I have compiled all of my use cases and practical tools into one handy guide. So, if you're ready to tear your hair out and question all your life choices, come along for the ride!

> Please bear with me for unleashing a barrage of memes in this blog post, I promise it will be worth it!

<p style="text-align: center;"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1677611421364/e99fc4ba-8e3d-44bf-ac6c-4a3987b5440e.webp" alt="" /></p>

Let's start with a formal introduction to VMs! why? because I am a perfectionista!

VMs allow users to run multiple operating systems on a single physical machine. Networking is a vital aspect of virtualization as it enables VMs to communicate with each other and access external networks. In this document, we will cover the basics of networking in VMs, including how to establish proper connections, verify connectivity, and troubleshoot common issues.

<p style="text-align: center;"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1677610774609/b5070c89-f338-42c9-ba27-5c5c1c068e9a.gif" alt="" /></p>

## Types of Networking in VMs

There are three types of networking in VMs:

1. **NAT (Network Address Translation)** - This type of networking enables a VM to access external networks through the host machine's IP address.

2. **Bridged Networking** - This type of networking enables a VM to access external networks using its own IP address.

3. **Host-Only Networking** - This type of networking allows communication only between VMs and the host machine.

## Establishing Proper Connections

To establish proper networking in VMs, follow the steps below:

1. Open the Virtual Machine software and select the VM you want to configure.

2. Go to the VM settings and select the network adapter.

3. Choose the type of networking you want to use (NAT, Bridged, or Host-Only).

4. If you select the NAT option, the VM will automatically use the host machine's IP address to access external networks.

    ```bash
    VBoxManage modifyvm "<VM Name>" --natnetwork1 "nat"
    ```

5. If you select the Bridged option, ensure that the VM's operating system has a valid IP address and can access external networks.

    Command:

    ```bash
    VBoxManage modifyvm "<VM Name>" --bridgeadapter1 "<Interface Name>"
    ```

6. If you select the Host-Only option, ensure that all VMs have unique IP addresses within the network.

    Command:

    ```bash
    VBoxManage modifyvm "<VM Name>" --hostonlyadapter1 "VirtualBox Host-Only Ethernet Adapter #<Adapter Number>"
    ```

7. Save the settings and start the VM.

### Setting up WI-FI connectivity within a bare VM

This is by far the easiest way to set up internet connectivity from within the VM if it is not configured by the cloud provider, for example setting up a Linux machine locally on your system/pc. The sample commands below is using the Arch Linux package manager, it can be replaced with respective PMs.

1. Open the terminal and enter the following command to install iwctl:

    ```bash
    sudo pacman -S iwctl
    ```

    This command installs iwctl, which is a command-line tool used to manage WiFi networks.

2. Enter the following command to start the iwctl interactive configuration tool:

    ```bash
    iwctl
    ```

    This command starts the iwctl interactive shell, which allows you to configure and manage WiFi networks.

3. Enter the following command to view available WiFi devices:

    ```bash
    device list
    ```

    This command displays a list of available WiFi devices on your system.

4. Enter the following command to turn on the WiFi device:

    ```bash
    station [device name] connect [SSID]
    ```

    Replace [device name] with the name of the WiFi device you want to use mostly it would be `wlan0` for the local wifi network, and replace [SSID] with the name of the WiFi network you want to connect to. This command turns on the WiFi device and connects to the specified WiFi network.

5. Enter the following command to enter the WiFi password:

    ```bash
    [password]
    ```

    Replace [password] with the password for the WiFi network you want to connect.

## Verifying Connectivity

To verify connectivity, follow the steps below:

1. Open the VM's command prompt or terminal window.

2. Ping: The ping command is used to test network connectivity by sending packets to a specific IP address or hostname and receiving a response. You can use the ping command to test connectivity to a remote host or website to verify that the Wi-Fi network is connected.

<p style="text-align: center;"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1677610886683/d03634a4-24e6-42a6-b0b7-e8947471f329.jpeg" alt="" /></p>

For example, you can use the following command to ping the Google DNS server (8.8.8.8) to test network connectivity:

```bash
ping 8.8.8.8
```

1. If you receive a response from the ping command, it means that the Wi-Fi network is connected and you can access the internet.

2. If the ping fails, check the network settings and ensure that the VM has a valid IP address.

## Troubleshooting Tips and Techniques

There are several network diagnostic tools available, each designed to help diagnose and troubleshoot different types of network issues. To begin with, you can start:

1. Check the network settings and ensure that the VM has a valid IP address.

2. Check the firewall settings and ensure that the necessary ports are open.

3. Check the network adapter drivers and ensure that they are up-to-date.

4. Check the physical network cables and ensure that they are properly connected.

5. Use the following list of network diagnostic tools to troubleshoot network issues further in a deeper context:

    * **Traceroute**: This tool is used to identify the path that network packets take from the source device to the destination device. It provides information on the number of hops or routers the packet passes through, as well as the time it takes to reach each hop.

        ```bash
        traceroute to google.com (172.217.4.78), 30 hops max, 60 byte packets
        ```

    * **Nslookup**: This tool is used to query Domain Name System (DNS) servers to obtain information about domain names, IP addresses, and other DNS records. It can be used to troubleshoot DNS resolution issues, verify DNS configuration, and perform various DNS-related tasks.

        ```bash
        nslookup google.com
        ```

    * **Netstat**: This tool displays active network connections, including established connections, listening ports, and other network statistics. It can be used to identify network connections that are using too much bandwidth or causing other performance issues.

        ```bash
        netstat -ano
        ```

    * **Ipconfig**: This tool displays information about the network adapters installed on a device, including IP addresses, subnet masks, default gateways, and other network configuration details.

        ```bash
        ipconfig /all
        ```

    * **dig**: This command is used to perform DNS lookups and display the response from the DNS server. It can be used to troubleshoot DNS-related issues.

        ```bash
        dig google.com
        ```

    * **iwconfig**: This command is used to configure wireless network interfaces. It displays the configuration of all the wireless network interfaces in the VM, including the name of the interface, its mode, frequency, and other details.

        ```bash
        iwconfig
        ```

    * **ip -a**: This command is used to display the IP address and network interface information for all the interfaces in the VM.

        ```bash
        ip -a
        ```

    * **iptables -L**: This command is used to display the current firewall rules in the VM.

        ```bash
        iptables -L
        ```

6. Outcome: You can expect to see a list of active network connections in the VM and their status.

7. Reset the network adapter by disabling and re-enabling it.

Other tools such as Telnet, Wireshark, Netcat, etc., can be used to diagnose network security threats and troubleshoot connectivity problems.

Additional tips to troubleshoot network issues include checking the DHCP settings, ensuring that the correct network interface is selected, and checking the network configuration files for errors. It is also important to ensure that the host machine's network settings are configured correctly and that there are no conflicts with the VM's network settings.

If you still face issues with connectivity, you may have to connect with your operator admin or just accept that:

<p style="text-align: center;"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1677611788516/ea65442b-c128-48bb-b93e-b9be755461ea.jpeg" alt="" /></p>
