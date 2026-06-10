package com.example.recipebook.web;

import com.example.recipebook.exception.BusinessRuleException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {
    private static final int MAX_FILES = 5;

    private final Path uploadPath;

    public FileUploadController(@Value("${app.upload-dir:uploads/photos}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostMapping(value = "/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<String> uploadPhotos(@RequestParam("files") List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BusinessRuleException("At least one photo is required");
        }

        if (files.size() > MAX_FILES) {
            throw new BusinessRuleException("Maximum photo count is 5");
        }

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException exception) {
            throw new BusinessRuleException("Could not create upload directory");
        }

        return files.stream().map(this::storePhoto).toList();
    }

    private String storePhoto(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessRuleException("Photo file must not be empty");
        }

        String extension = detectImageExtension(file);
        String fileName = UUID.randomUUID() + extension;
        Path destination = uploadPath.resolve(fileName).normalize();

        if (!destination.startsWith(uploadPath)) {
            throw new BusinessRuleException("Invalid photo file path");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new BusinessRuleException("Could not save photo");
        }

        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();

        return baseUrl + "/uploads/photos/" + fileName;
    }

    private String detectImageExtension(MultipartFile file) {
        try (
                InputStream inputStream = file.getInputStream();
                ImageInputStream imageInputStream = ImageIO.createImageInputStream(inputStream)
        ) {
            if (imageInputStream == null) {
                throw new BusinessRuleException("Only image files are allowed");
            }

            Iterator<ImageReader> readers = ImageIO.getImageReaders(imageInputStream);

            if (!readers.hasNext()) {
                throw new BusinessRuleException("Only image files are allowed");
            }

            ImageReader reader = readers.next();

            try {
                String formatName = reader.getFormatName().toLowerCase(Locale.ROOT);
                return resolveExtensionByFormat(formatName);
            } finally {
                reader.dispose();
            }
        } catch (IOException exception) {
            throw new BusinessRuleException("Could not validate photo file");
        }
    }

    private String resolveExtensionByFormat(String formatName) {
        return switch (formatName) {
            case "jpeg", "jpg" -> ".jpg";
            case "png" -> ".png";
            case "gif" -> ".gif";
            case "webp" -> ".webp";
            default -> throw new BusinessRuleException("Unsupported image format");
        };
    }
}