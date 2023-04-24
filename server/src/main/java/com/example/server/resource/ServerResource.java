package com.example.server.resource;

import com.example.server.enumeration.Status;
import com.example.server.model.Response;
import com.example.server.model.Server;
import com.example.server.service.implementation.ServerServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Map;

import static com.example.server.enumeration.Status.SERVER_UP;
import static java.nio.file.Files.readAllBytes;
import static java.nio.file.Paths.get;
import static java.time.LocalDateTime.*;
import static java.util.Map.of;
import static org.springframework.http.HttpStatus.OK;
import static org.springframework.http.MediaType.IMAGE_PNG_VALUE;

@RestController
@RequestMapping("/server")
@RequiredArgsConstructor
public class ServerResource
{
    private final ServerServiceImpl serverService;

    @GetMapping("/list")
    public ResponseEntity<Response> getServers(){
        return ResponseEntity.ok(
                Response.builder()
                        .timeStamp(now())
                        .data(of("servers",serverService.list(30)))
                        .message("Servers retrieved")
                        .status(OK)
                        .statusCode(OK.value())
                        .build()
        );
    }

    @GetMapping("/ping/{ipAddress}")
    public ResponseEntity<Response> pingServer(@PathVariable("ipAddress") String ipAddress) throws IOException
    {

        Server server = serverService.ping(ipAddress);
        return ResponseEntity.ok(
                Response.builder()
                        .timeStamp(now())
                        .data(of("server",server))
                        .message(server.getStatus() == SERVER_UP ? "Server pinged successfully" : "Server ping failed")
                        .status(OK)
                        .statusCode(OK.value())
                        .build()
        );
    }


    @PostMapping("/save")
    public ResponseEntity<Response> saveServer(@RequestBody @Valid Server server){
        return ResponseEntity.ok(
                Response.builder()
                        .timeStamp(now())
                        .data(of("server",serverService.create(server)))
                        .message("server created")
                        .status(OK)
                        .statusCode(OK.value())
                        .build()
        );
    }


    @GetMapping("/get/{id}")
    public ResponseEntity<Response> getServer(@PathVariable("id") Long id){
        return ResponseEntity.ok(
                Response.builder()
                        .timeStamp(now())
                        .data(of("servers",serverService.get(id)))
                        .message("Server retrieved")
                        .status(OK)
                        .statusCode(OK.value())
                        .build()
        );
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Response> deleteServer(@PathVariable("id") Long id){
        return ResponseEntity.ok(
                Response.builder()
                        .timeStamp(now())
                        .data(of("deleted",serverService.delete(id)))
                        .message("Server deleted")
                        .status(OK)
                        .statusCode(OK.value())
                        .build()
        );
    }


    @GetMapping(value = "/image/{fileName}",produces = IMAGE_PNG_VALUE)
    public byte[] getServerImage(@PathVariable("fileName") String fileName) throws IOException
    {
        return readAllBytes(get(System.getProperty("user.home")+ "/Downloads/images/" + fileName));
    }


}
