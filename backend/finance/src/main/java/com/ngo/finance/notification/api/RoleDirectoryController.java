package com.ngo.finance.notification.api;

import com.ngo.finance.notification.dto.RoleDirectoryEntryDto;
import com.ngo.finance.notification.service.RoleDirectoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Who holds each organisational role, for resolving reminder recipients. */
@Slf4j
@RestController
@RequestMapping("/api/v1/role-directory")
@Tag(name = "Role directory", description = "Organisational role holders and deputies")
public class RoleDirectoryController {

    private final RoleDirectoryService roleDirectoryService;

    @Autowired
    public RoleDirectoryController(RoleDirectoryService roleDirectoryService) {
        this.roleDirectoryService = roleDirectoryService;
    }

    @GetMapping
    @Operation(summary = "List role holders and deputies")
    public ResponseEntity<List<RoleDirectoryEntryDto>> getDirectory() {
        return ResponseEntity.ok(roleDirectoryService.getDirectory());
    }

    @PutMapping
    @Operation(summary = "Assign role holders and deputies")
    public ResponseEntity<List<RoleDirectoryEntryDto>> updateDirectory(
            @RequestBody List<RoleDirectoryEntryDto> entries) {
        log.info("PUT /api/v1/role-directory - {} entr(ies)", entries == null ? 0 : entries.size());
        return ResponseEntity.ok(roleDirectoryService.updateDirectory(entries));
    }
}
